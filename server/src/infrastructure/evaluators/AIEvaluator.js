const Evaluator = require('./Evaluator');
const { buildSystemPrompt, buildUserPrompt } = require('../ai/evaluationPrompt');

/**
 * AIEvaluator — uses an AIProvider to evaluate submissions.
 * Does NOT depend on OpenAI directly; depends on the AIProvider abstraction.
 */
class AIEvaluator extends Evaluator {
  /**
   * @param {AIProvider} aiProvider
   */
  constructor(aiProvider) {
    super();
    this.aiProvider = aiProvider;
  }

  getType() {
    return 'AI';
  }

  async evaluate(submission, problem) {
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(problem, submission);

    const rawResponse = await this.aiProvider.complete(systemPrompt, userPrompt);

    const result = this._parseAndValidate(rawResponse);
    return result;
  }

  _parseAndValidate(rawResponse) {
    let parsed;
    try {
      parsed = typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse;
    } catch {
      throw new Error('AI returned malformed JSON: ' + rawResponse?.slice?.(0, 200));
    }

    // Validate required top-level fields
    if (typeof parsed.overallScore !== 'number') {
      throw new Error('AI response missing overallScore');
    }
    if (!Array.isArray(parsed.criteria) || parsed.criteria.length === 0) {
      throw new Error('AI response missing criteria array');
    }

    // Clamp scores to valid range
    parsed.overallScore = Math.min(10, Math.max(0, parsed.overallScore));
    parsed.criteria = parsed.criteria.map(c => ({
      criterion: String(c.criterion || ''),
      score: Math.min(10, Math.max(0, Number(c.score) || 0)),
      evidence: String(c.evidence || ''),
      concern: String(c.concern || ''),
      suggestion: String(c.suggestion || ''),
      confidence: Math.min(1, Math.max(0, Number(c.confidence) || 0.8)),
    }));

    parsed.summary = String(parsed.summary || '');
    parsed.strengths = Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [];
    parsed.priorityImprovements = Array.isArray(parsed.priorityImprovements)
      ? parsed.priorityImprovements.map(String)
      : [];

    return parsed;
  }
}

module.exports = AIEvaluator;
