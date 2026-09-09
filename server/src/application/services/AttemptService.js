const Attempt = require('../../domain/attempt/Attempt');
const { ATTEMPT_STATUSES } = require('../../domain/attempt/Attempt');
const Problem = require('../../domain/problem/Problem');

class AttemptService {
  /**
   * Creates a new attempt for a problem.
   * Increments attempt number automatically.
   */
  async createAttempt(problemId, learnerId = 'anonymous') {
    const problem = await Problem.findById(problemId);
    if (!problem || !problem.isActive) {
      throw new Error('Problem not found');
    }

    // Count previous attempts for this learner + problem
    const previousCount = await Attempt.countDocuments({ problemId, learnerId });

    const attempt = new Attempt({
      problemId,
      learnerId,
      status: ATTEMPT_STATUSES.DRAFT,
      attemptNumber: previousCount + 1,
    });

    return attempt.save();
  }

  async getAttemptById(attemptId) {
    return Attempt.findById(attemptId).populate('problemId');
  }

  async getAttemptsByProblem(problemId, learnerId = 'anonymous') {
    return Attempt.find({ problemId, learnerId }).sort({ createdAt: -1 });
  }

  async getHistory(learnerId = 'anonymous') {
    return Attempt.find({ learnerId })
      .populate('problemId', 'title slug difficulty category')
      .populate('evaluationId', 'overallScore status evaluatorType')
      .sort({ createdAt: -1 });
  }

  /**
   * Transitions attempt status with explicit validation.
   */
  async transitionStatus(attempt, newStatus) {
    if (!attempt.canTransitionTo(newStatus)) {
      throw new Error(
        `Invalid status transition: ${attempt.status} → ${newStatus}`
      );
    }
    attempt.status = newStatus;
    if (newStatus === ATTEMPT_STATUSES.SUBMITTED) {
      attempt.submittedAt = new Date();
    }
    if (newStatus === ATTEMPT_STATUSES.COMPLETED) {
      attempt.completedAt = new Date();
    }
    return attempt.save();
  }
}

module.exports = new AttemptService();
