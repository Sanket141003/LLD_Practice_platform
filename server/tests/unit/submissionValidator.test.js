const { validateSubmissionContent, wordCount } = require('../../src/validators/submissionValidator');

describe('submissionValidator', () => {
  describe('wordCount', () => {
    it('returns 0 for empty string', () => expect(wordCount('')).toBe(0));
    it('returns 0 for null', () => expect(wordCount(null)).toBe(0));
    it('counts words correctly', () => expect(wordCount('hello world foo')).toBe(3));
    it('handles extra whitespace', () => expect(wordCount('  hello   world  ')).toBe(2));
  });

  describe('validateSubmissionContent', () => {
    const validContent = {
      requirementsUnderstanding: 'The system must handle parking lots with multiple floors and vehicle types such as car truck motorcycle',
      assumptions: 'Single location parking lot',
      classes: 'ParkingLot ParkingFloor ParkingSpot Vehicle Ticket PricingStrategy AllocationService PricingCalculator EntryGate ExitGate',
      responsibilities: 'ParkingLot manages floors. ParkingFloor manages spots. PricingStrategy calculates fees based on vehicle type and duration.',
      relationships: 'ParkingLot has many ParkingFloors. ParkingFloor has many ParkingSpots.',
      flow: 'Vehicle enters, finds spot, gets ticket, exits and pays',
      patterns: 'Strategy for pricing, Factory for vehicle creation',
      edgeCases: 'Full lot, invalid vehicle type',
      extensibility: 'New vehicle types via inheritance',
      tradeoffs: 'Simplicity vs real-time concurrency handling',
    };

    it('accepts a valid complete submission', () => {
      const result = validateSubmissionContent(validContent);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects null content', () => {
      const result = validateSubmissionContent(null);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('rejects empty requirementsUnderstanding', () => {
      const content = { ...validContent, requirementsUnderstanding: '' };
      const result = validateSubmissionContent(content);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Requirements Understanding'))).toBe(true);
    });

    it('rejects empty classes section', () => {
      const content = { ...validContent, classes: 'too short' };
      const result = validateSubmissionContent(content);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Classes'))).toBe(true);
    });

    it('rejects if fewer than 5 sections filled', () => {
      const content = {
        requirementsUnderstanding: 'handles parking lot management with multiple floors',
        classes: 'ParkingLot ParkingFloor ParkingSpot Vehicle Ticket TicketService',
        responsibilities: 'ParkingLot manages floors and allocates spots',
      };
      const result = validateSubmissionContent(content);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('5 sections'))).toBe(true);
    });
  });
});
