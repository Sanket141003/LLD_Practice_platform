/**
 * Evaluator interface (base class in JS).
 *
 * All evaluators must implement evaluate().
 * This abstraction allows swapping AI, rule-based, human, or demo evaluators
 * without changing the EvaluationService or practice flow.
 */
class Evaluator {
  /**
   * @param {Object} submission - Submission document
   * @param {Object} problem - Problem document
   * @returns {Promise<EvaluationResult>}
   */
  async evaluate(submission, problem) {
    throw new Error('evaluate() must be implemented by subclass');
  }

  /**
   * Returns the evaluator type identifier.
   * @returns {string}
   */
  getType() {
    throw new Error('getType() must be implemented by subclass');
  }
}

module.exports = Evaluator;
