const AIEvaluator = require('../../src/infrastructure/evaluators/AIEvaluator');

describe('AIEvaluator', () => {
  const mockAIProvider = {
    complete: jest.fn(),
  };

  const evaluator = new AIEvaluator(mockAIProvider);

  const mockSubmission = {
    content: {
      requirementsUnderstanding: 'Handles parking lots with multiple floors',
      classes: 'ParkingLot ParkingFloor ParkingSpot Vehicle Ticket',
      responsibilities: 'ParkingLot manages floors. ParkingFloor manages spots.',
    },
  };

  const mockProblem = {
    title: 'Parking Lot',
    difficulty: 'Medium',
    description: 'Design a parking lot system',
    requirements: ['Support multiple floors', 'Handle vehicles'],
    constraints: ['One vehicle per spot'],
    expectedConsiderations: ['Who allocates spots?'],
    rubric: [{ criterion: 'Class Responsibilities', weight: 15, description: '' }],
    rubricVersion: '1.0',
  };

  it('returns evaluator type AI', () => {
    expect(evaluator.getType()).toBe('AI');
  });

  it('parses valid AI response', async () => {
    const validResponse = JSON.stringify({
      overallScore: 7.5,
      summary: 'Good design overall',
      criteria: [
        {
          criterion: 'Class Responsibilities',
          score: 8,
          evidence: 'ParkingLot manages floors',
          concern: '',
          suggestion: 'Consider separating allocation',
          confidence: 0.9,
        },
      ],
      strengths: ['Good class separation'],
      priorityImprovements: ['Add pricing abstraction'],
    });

    mockAIProvider.complete.mockResolvedValueOnce(validResponse);
    const result = await evaluator.evaluate(mockSubmission, mockProblem);

    expect(result.overallScore).toBe(7.5);
    expect(result.criteria).toHaveLength(1);
    expect(result.strengths).toContain('Good class separation');
  });

  it('throws on malformed AI JSON', async () => {
    mockAIProvider.complete.mockResolvedValueOnce('not valid json {{');
    await expect(evaluator.evaluate(mockSubmission, mockProblem)).rejects.toThrow('malformed JSON');
  });

  it('throws when overallScore is missing', async () => {
    mockAIProvider.complete.mockResolvedValueOnce(JSON.stringify({
      summary: 'ok',
      criteria: [{ criterion: 'test', score: 5 }],
    }));
    await expect(evaluator.evaluate(mockSubmission, mockProblem)).rejects.toThrow('overallScore');
  });

  it('clamps scores to valid range', async () => {
    mockAIProvider.complete.mockResolvedValueOnce(JSON.stringify({
      overallScore: 15, // out of range
      summary: 'ok',
      criteria: [{ criterion: 'test', score: -5, evidence: '', concern: '', suggestion: '', confidence: 1.5 }],
      strengths: [],
      priorityImprovements: [],
    }));
    const result = await evaluator.evaluate(mockSubmission, mockProblem);
    expect(result.overallScore).toBe(10);
    expect(result.criteria[0].score).toBe(0);
    expect(result.criteria[0].confidence).toBe(1);
  });
});
