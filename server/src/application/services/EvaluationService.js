const Evaluation = require('../../domain/evaluation/Evaluation');
const { EVALUATION_STATUSES } = require('../../domain/evaluation/Evaluation');
const Attempt = require('../../domain/attempt/Attempt');
const { ATTEMPT_STATUSES } = require('../../domain/attempt/Attempt');
const Submission = require('../../domain/submission/Submission');
const Problem = require('../../domain/problem/Problem');
const EvaluatorFactory = require('../../infrastructure/evaluators/EvaluatorFactory');

class EvaluationService {
  /**
   * Triggers evaluation for a submission.
   * - Checks for duplicate evaluation (idempotency)
   * - Stores evaluation record BEFORE calling AI (submission is never lost)
   * - Runs AI asynchronously (fire-and-forget from request)
   */
  async startEvaluation(attemptId) {
    const attempt = await Attempt.findById(attemptId).populate('problemId');
    if (!attempt) throw new Error('Attempt not found');

    if (attempt.status !== ATTEMPT_STATUSES.SUBMITTED &&
        attempt.status !== ATTEMPT_STATUSES.FAILED) {
      throw new Error(`Cannot start evaluation for attempt in status: ${attempt.status}`);
    }

    const submission = await Submission.findById(attempt.submissionId);
    if (!submission) throw new Error('Submission not found for this attempt');

    // Idempotency — check if evaluation already exists and is not failed
    const existingEval = await Evaluation.findOne({
      submissionId: submission._id,
      status: { $in: [EVALUATION_STATUSES.EVALUATING, EVALUATION_STATUSES.COMPLETED] },
    });

    if (existingEval) {
      return existingEval; // Return existing, don't re-evaluate
    }

    const evaluatorType = EvaluatorFactory.getDefaultType();

    // Create evaluation record FIRST — submission is safe even if AI fails
    const evaluation = await Evaluation.create({
      submissionId: submission._id,
      attemptId: attempt._id,
      status: EVALUATION_STATUSES.EVALUATING,
      evaluatorType,
      rubricVersion: attempt.problemId.rubricVersion || '1.0',
    });

    // Update attempt
    attempt.status = ATTEMPT_STATUSES.EVALUATING;
    attempt.evaluationId = evaluation._id;
    await attempt.save();

    // Run evaluation asynchronously — don't block HTTP response
    this._runEvaluation(evaluation, submission, attempt.problemId).catch(err => {
      console.error('[EvaluationService] Unhandled evaluation error:', err.message);
    });

    return evaluation;
  }

  /**
   * Internal: runs the evaluator and stores the result.
   * Handles all failures gracefully.
   */
  async _runEvaluation(evaluation, submission, problem) {
    const evaluator = EvaluatorFactory.create(evaluation.evaluatorType);

    try {
      console.log(`[EvaluationService] Starting evaluation ${evaluation._id} (${evaluation.evaluatorType})`);

      const result = await evaluator.evaluate(submission, problem);

      await Evaluation.findByIdAndUpdate(evaluation._id, {
        status: EVALUATION_STATUSES.COMPLETED,
        overallScore: result.overallScore,
        summary: result.summary,
        criteria: result.criteria,
        strengths: result.strengths,
        priorityImprovements: result.priorityImprovements,
        completedAt: new Date(),
        errorMessage: null,
      });

      await Attempt.findByIdAndUpdate(evaluation.attemptId, {
        status: ATTEMPT_STATUSES.COMPLETED,
        completedAt: new Date(),
      });

      console.log(`[EvaluationService] Evaluation ${evaluation._id} completed. Score: ${result.overallScore}`);
    } catch (err) {
      console.error(`[EvaluationService] Evaluation ${evaluation._id} failed:`, err.message);

      await Evaluation.findByIdAndUpdate(evaluation._id, {
        status: EVALUATION_STATUSES.FAILED,
        errorMessage: err.message,
        failedAt: new Date(),
      });

      await Attempt.findByIdAndUpdate(evaluation.attemptId, {
        status: ATTEMPT_STATUSES.FAILED,
      });
    }
  }

  async getEvaluationById(evaluationId) {
    return Evaluation.findById(evaluationId);
  }

  async getEvaluationByAttempt(attemptId) {
    return Evaluation.findOne({ attemptId });
  }

  /**
   * Retry a failed evaluation.
   */
  async retryEvaluation(evaluationId) {
    const evaluation = await Evaluation.findById(evaluationId).populate('submissionId');
    if (!evaluation) throw new Error('Evaluation not found');

    if (evaluation.status !== EVALUATION_STATUSES.FAILED) {
      throw new Error('Can only retry a failed evaluation');
    }

    const submission = await Submission.findById(evaluation.submissionId);
    const attempt = await Attempt.findById(evaluation.attemptId).populate('problemId');
    if (!attempt) throw new Error('Attempt not found');

    // Reset evaluation status
    await Evaluation.findByIdAndUpdate(evaluationId, {
      status: EVALUATION_STATUSES.EVALUATING,
      errorMessage: null,
      failedAt: null,
    });

    await Attempt.findByIdAndUpdate(attempt._id, {
      status: ATTEMPT_STATUSES.EVALUATING,
    });

    const updatedEval = await Evaluation.findById(evaluationId);
    this._runEvaluation(updatedEval, submission, attempt.problemId).catch(err => {
      console.error('[EvaluationService] Retry evaluation error:', err.message);
    });

    return updatedEval;
  }
}

module.exports = new EvaluationService();
