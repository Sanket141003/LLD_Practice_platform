const DemoEvaluator = require('../../src/infrastructure/evaluators/DemoEvaluator');

describe('DemoEvaluator', () => {
  const evaluator = new DemoEvaluator();

  const mockSubmission = {
    content: {
      requirementsUnderstanding: 'Design a parking lot',
      classes: 'ParkingLot ParkingSpot Vehicle Ticket',
      responsibilities: 'ParkingLot manages allocation',
    },
  };

  const mockProblem = { title: 'Parking Lot', rubric: [] };

  it('returns evaluator type DEMO', () => {
    expect(evaluator.getType()).toBe('DEMO');
  });

  it('returns structured result with all required fields', async () => {
    const result = await evaluator.evaluate(mockSubmission, mockProblem);

    expect(result).toHaveProperty('overallScore');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('criteria');
    expect(result).toHaveProperty('strengths');
    expect(result).toHaveProperty('priorityImprovements');
    expect(Array.isArray(result.criteria)).toBe(true);
    expect(result.criteria.length).toBeGreaterThan(0);
  });

  it('each criterion has required fields', async () => {
    const result = await evaluator.evaluate(mockSubmission, mockProblem);
    for (const c of result.criteria) {
      expect(c).toHaveProperty('criterion');
      expect(c).toHaveProperty('score');
      expect(c).toHaveProperty('evidence');
      expect(c).toHaveProperty('suggestion');
      expect(c).toHaveProperty('confidence');
    }
  });

  it('score is in valid range', async () => {
    const result = await evaluator.evaluate(mockSubmission, mockProblem);
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(10);
  });
});
