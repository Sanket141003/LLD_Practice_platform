const Evaluator = require('./Evaluator');

/**
 * DemoEvaluator — returns realistic mock feedback.
 * Used when DEMO_MODE=true so the app works without an API key.
 * Makes it obvious in the response that feedback is demo-generated.
 */
class DemoEvaluator extends Evaluator {
  getType() {
    return 'DEMO';
  }

  async evaluate(submission, problem) {
    // Simulate a short delay to mimic real evaluation
    await new Promise(resolve => setTimeout(resolve, 1500));

    const content = submission.content;
    const hasClasses = (content.classes || '').length > 20;
    const hasResponsibilities = (content.responsibilities || '').length > 20;

    return {
      overallScore: hasClasses && hasResponsibilities ? 7.4 : 5.2,
      summary: `[DEMO MODE] This is simulated feedback for "${problem.title}". In production, real AI evaluation would analyze your actual design choices and provide specific evidence-based feedback.`,
      criteria: [
        {
          criterion: 'Requirement Understanding',
          score: 7,
          evidence: 'Learner addressed the main functional requirements.',
          concern: 'Some non-functional requirements were not discussed.',
          suggestion: 'Consider explicitly addressing concurrency, capacity, and error scenarios.',
          confidence: 0.9,
        },
        {
          criterion: 'Class Responsibilities',
          score: hasClasses ? 8 : 4,
          evidence: hasClasses ? 'Multiple classes identified with distinct roles.' : 'Few classes defined.',
          concern: hasClasses ? 'Some classes may have overlapping responsibilities.' : 'Core domain classes are missing.',
          suggestion: 'Apply Single Responsibility Principle — each class should have one reason to change.',
          confidence: 0.85,
        },
        {
          criterion: 'Coupling / Cohesion',
          score: 6,
          evidence: 'Basic relationships described between classes.',
          concern: 'Tight coupling between service and data layers may limit testability.',
          suggestion: 'Introduce interfaces or dependency injection to decouple components.',
          confidence: 0.8,
        },
        {
          criterion: 'Encapsulation / Interfaces',
          score: 7,
          evidence: 'Internal state is not exposed directly.',
          concern: 'Interfaces not explicitly defined for key abstractions.',
          suggestion: 'Define explicit interfaces for Pricing, Allocation, and Notification strategies.',
          confidence: 0.88,
        },
        {
          criterion: 'Abstraction / Patterns',
          score: 6,
          evidence: 'Some patterns mentioned.',
          concern: 'Patterns should be justified by actual requirements, not used for demonstration.',
          suggestion: 'For each pattern, explain the specific extensibility or maintenance problem it solves.',
          confidence: 0.82,
        },
        {
          criterion: 'Extensibility',
          score: hasResponsibilities ? 8 : 5,
          evidence: 'Design shows awareness of future changes.',
          concern: 'Hard-coded values may limit extensibility.',
          suggestion: 'Use strategy/factory patterns for variable behavior like pricing or allocation.',
          confidence: 0.87,
        },
        {
          criterion: 'Edge Cases',
          score: 6,
          evidence: 'Some edge cases mentioned.',
          concern: 'Concurrent access and failure scenarios not addressed.',
          suggestion: 'Consider: double-booking, payment failure, system restart recovery.',
          confidence: 0.9,
        },
        {
          criterion: 'Behaviour / Flow',
          score: 7,
          evidence: 'Main flow described step-by-step.',
          concern: 'Error paths not shown.',
          suggestion: 'Add alternative flows for failure scenarios.',
          confidence: 0.92,
        },
        {
          criterion: 'Explanation Quality',
          score: 7,
          evidence: 'Reasoning is generally clear.',
          concern: 'Some decisions lack explicit justification.',
          suggestion: 'For each major design choice, state the "why" explicitly.',
          confidence: 0.88,
        },
        {
          criterion: 'Trade-offs',
          score: 5,
          evidence: 'Trade-offs section has some content.',
          concern: 'Trade-offs feel generic rather than specific to this design.',
          suggestion: 'Identify specific trade-offs: simplicity vs. flexibility, consistency vs. availability.',
          confidence: 0.85,
        },
      ],
      strengths: [
        'Good attempt at identifying core domain objects',
        'Main flow is clearly described',
        'Shows awareness of extensibility concerns',
      ],
      priorityImprovements: [
        'Define explicit interfaces for key abstractions (Pricing, Allocation)',
        'Address concurrency and failure edge cases',
        'Justify each design pattern with a specific requirement',
      ],
    };
  }
}

module.exports = DemoEvaluator;
