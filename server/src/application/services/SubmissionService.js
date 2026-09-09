const Submission = require('../../domain/submission/Submission');
const Attempt = require('../../domain/attempt/Attempt');
const { ATTEMPT_STATUSES } = require('../../domain/attempt/Attempt');
const { validateSubmissionContent } = require('../../validators/submissionValidator');

class SubmissionService {
  /**
   * Saves a draft submission. Does not trigger evaluation.
   * Can be called multiple times (upsert on attemptId).
   */
  async saveDraft(attemptId, content) {
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) throw new Error('Attempt not found');

    if (attempt.status === ATTEMPT_STATUSES.COMPLETED) {
      throw new Error('Cannot update a completed attempt');
    }

    let submission = await Submission.findOne({ attemptId });

    if (submission) {
      submission.content = content;
      submission.isDraft = true;
      return submission.save();
    }

    submission = new Submission({
      attemptId,
      format: 'TEXT',
      content,
      isDraft: true,
    });
    return submission.save();
  }

  /**
   * Finalizes a submission for evaluation.
   * Validates content before proceeding.
   */
  async finalizeSubmission(attemptId, content) {
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) throw new Error('Attempt not found');

    if (attempt.status === ATTEMPT_STATUSES.SUBMITTED ||
        attempt.status === ATTEMPT_STATUSES.EVALUATING ||
        attempt.status === ATTEMPT_STATUSES.COMPLETED) {
      throw new Error('Attempt has already been submitted');
    }

    // Deterministic validation — reject before AI call
    const validation = validateSubmissionContent(content);
    if (!validation.valid) {
      const err = new Error('Submission validation failed');
      err.validationErrors = validation.errors;
      err.statusCode = 422;
      throw err;
    }

    let submission = await Submission.findOne({ attemptId });

    if (submission) {
      submission.content = content;
      submission.isDraft = false;
      submission.submittedAt = new Date();
      submission.version = (submission.version || 1) + 1;
      await submission.save();
    } else {
      submission = await Submission.create({
        attemptId,
        format: 'TEXT',
        content,
        isDraft: false,
        submittedAt: new Date(),
      });
    }

    // Update attempt
    attempt.submissionId = submission._id;
    attempt.status = ATTEMPT_STATUSES.SUBMITTED;
    attempt.submittedAt = new Date();
    await attempt.save();

    return submission;
  }

  async getSubmissionById(submissionId) {
    return Submission.findById(submissionId);
  }

  async getSubmissionByAttempt(attemptId) {
    return Submission.findOne({ attemptId });
  }
}

module.exports = new SubmissionService();
