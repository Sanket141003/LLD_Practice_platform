const config = require('../../config');
const AIEvaluator = require('./AIEvaluator');
const RuleBasedEvaluator = require('./RuleBasedEvaluator');
const DemoEvaluator = require('./DemoEvaluator');
const OpenAIProvider = require('../ai/OpenAIProvider');

/**
 * EvaluatorFactory — selects the appropriate evaluator.
 * Adding a new evaluator (HumanEvaluator) only requires changes here.
 */
class EvaluatorFactory {
  static create(type) {
    if (config.demoMode) {
      return new DemoEvaluator();
    }

    switch (type) {
      case 'AI': {
        const aiProvider = new OpenAIProvider();
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

  /**
   * Returns default evaluator type based on environment.
   */
  static getDefaultType() {
    if (config.demoMode) return 'DEMO';
    if (!config.openai.apiKey) return 'DEMO';
    return 'AI';
  }
}

module.exports = EvaluatorFactory;
