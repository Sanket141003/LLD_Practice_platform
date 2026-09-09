/**
 * AIProvider abstraction.
 * Concrete providers (OpenAI, Anthropic, etc.) implement this interface.
 * The evaluator depends on AIProvider, not on any specific SDK.
 */
class AIProvider {
  /**
   * Send a prompt and return a text response.
   * @param {string} systemPrompt
   * @param {string} userPrompt
   * @returns {Promise<string>}
   */
  async complete(systemPrompt, userPrompt) {
    throw new Error('complete() must be implemented by subclass');
  }
}

module.exports = AIProvider;
