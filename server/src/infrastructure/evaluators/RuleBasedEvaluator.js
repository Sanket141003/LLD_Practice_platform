const Evaluator = require('./Evaluator');

/**
 * RuleBasedEvaluator — deterministic validation before AI evaluation.
 * Also usable as a standalone evaluator for structure/completeness checks.
 *
 * This demonstrates Change Test B: adding a new evaluator without changing the practice flow.
 */
class RuleBasedEvaluator extends Evaluator {
  getType() {
    return 'RULE_BASED';
  }

  async evaluate(submission, problem) {
    const content = submission.content;
    const criteria = [];
    let totalScore = 0;

    const sections = [
      { key: 'requirementsUnderstanding', label: 'Requirement Understanding', weight: 10 },
      { key: 'classes', label: 'Class Responsibilities', weight: 15 },
      { key: 'responsibilities', label: 'Responsibilities Coverage', weight: 15 },
      { key: 'relationships', label: 'Encapsulation / Interfaces', weight: 10 },
      { key: 'patterns', label: 'Abstraction / Patterns', weight: 10 },
      { key: 'extensibility', label: 'Extensibility', weight: 15 },
      { key: 'edgeCases', label: 'Edge Cases', weight: 10 },
      { key: 'flow', label: 'Behaviour / Flow', weight: 5 },
      { key: 'assumptions', label: 'Explanation Quality', weight: 5 },
      { key: 'tradeoffs', label: 'Trade-offs', weight: 5 },
    ];

    for (const section of sections) {
      const text = content[section.key] || '';
      const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

      let score = 0;
      let concern = '';
      let suggestion = '';

      if (wordCount === 0) {
        score = 0;
        concern = 'Section is empty';
        suggestion = `Please provide content for "${section.label}"`;
      } else if (wordCount < 10) {
        score = 3;
        concern = 'Section is very brief';
        suggestion = 'Expand with more detail and specific examples';
      } else if (wordCount < 30) {
        score = 5;
        concern = 'Some detail present but could be more thorough';
        suggestion = 'Add more specifics, class names, or reasoning';
      } else if (wordCount < 80) {
        score = 7;
        concern = '';
        suggestion = 'Consider adding more depth to strengthen this section';
      } else {
        score = 9;
        concern = '';
        suggestion = 'Good coverage';
      }

      totalScore += (score * section.weight) / 100;
      criteria.push({
        criterion: section.label,
        score,
        evidence: wordCount > 0 ? `${wordCount} words provided` : 'No content',
        concern,
        suggestion,
        confidence: 0.95,
      });
    }

    const strengths = criteria.filter(c => c.score >= 7).map(c => `Good coverage in ${c.criterion}`);
    const priorityImprovements = criteria
      .filter(c => c.score < 5)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map(c => `Improve: ${c.criterion} — ${c.suggestion}`);

    return {
      overallScore: Math.round(totalScore * 10) / 10,
      summary: 'Rule-based structural evaluation. Scores reflect content coverage, not design quality.',
      criteria,
      strengths: strengths.slice(0, 3),
      priorityImprovements,
    };
  }
}

module.exports = RuleBasedEvaluator;
