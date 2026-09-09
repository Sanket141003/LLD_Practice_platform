const config = require('../../config');
const AIEvaluator = require('./AIEvaluator');
const RuleBasedEvaluator = require('./RuleBasedEvaluator');
const DemoEvaluator = require('./DemoEvaluator');
const OpenAIProvider = require('../ai/OpenAIProvider');
const GeminiProvider = require('../ai/GeminiProvider');

/**
 * EvaluatorFactory — selects the appropriate evaluator.
 * Adding a new evaluator or provider only requires changes here.
 */
class EvaluatorFactory {
  static create(type) {
    if (config.demoMode) {
      return new DemoEvaluator();
    }

    switch (type) {
      case 'AI': {
        const aiProvider = EvaluatorFactory._buildAIProvider();
        return new AIEvaluator(aiProvider);
      }
      case 'RULE_BASED':
        return new RuleBasedEvaluator();
      case 'DEMO':
        return new DemoEvaluator();
      default:
        return new DemoEvaluator();
    }
  }

  static _buildAIProvider() {
    switch (config.aiProvider) {
      case 'openai':
        return new OpenAIProvider();
      case 'gemini':
        return new GeminiProvider();
      default:
        // Auto-detect based on which key is present
        if (config.gemini.apiKey) return new GeminiProvider();
        if (config.openai.apiKey) return new OpenAIProvider();
        throw new Error('No AI provider configured. Set GEMINI_API_KEY or OPENAI_API_KEY.');
    }
  }

  static getDefaultType() {
    if (config.demoMode) return 'DEMO';
    if (!config.gemini.apiKey && !config.openai.apiKey) return 'DEMO';
    return 'AI';
  }
}

module.exports = EvaluatorFactory;
