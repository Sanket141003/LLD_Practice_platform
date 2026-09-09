const Attempt = require('../../src/domain/attempt/Attempt');
const { ATTEMPT_STATUSES } = require('../../src/domain/attempt/Attempt');

describe('Attempt status transitions', () => {
  function makeAttempt(status) {
    const attempt = new Attempt({
      problemId: new (require('mongoose').Types.ObjectId)(),
      learnerId: 'test-user',
      status,
      attemptNumber: 1,
    });
    return attempt;
  }

  it('DRAFT can transition to SUBMITTED', () => {
    const a = makeAttempt(ATTEMPT_STATUSES.DRAFT);
    expect(a.canTransitionTo(ATTEMPT_STATUSES.SUBMITTED)).toBe(true);
  });

  it('DRAFT cannot transition to COMPLETED', () => {
    const a = makeAttempt(ATTEMPT_STATUSES.DRAFT);
    expect(a.canTransitionTo(ATTEMPT_STATUSES.COMPLETED)).toBe(false);
  });

  it('SUBMITTED can transition to EVALUATING', () => {
    const a = makeAttempt(ATTEMPT_STATUSES.SUBMITTED);
    expect(a.canTransitionTo(ATTEMPT_STATUSES.EVALUATING)).toBe(true);
  });

  it('EVALUATING can transition to COMPLETED', () => {
    const a = makeAttempt(ATTEMPT_STATUSES.EVALUATING);
    expect(a.canTransitionTo(ATTEMPT_STATUSES.COMPLETED)).toBe(true);
  });

  it('EVALUATING can transition to FAILED', () => {
    const a = makeAttempt(ATTEMPT_STATUSES.EVALUATING);
    expect(a.canTransitionTo(ATTEMPT_STATUSES.FAILED)).toBe(true);
  });

  it('COMPLETED cannot transition to EVALUATING', () => {
    const a = makeAttempt(ATTEMPT_STATUSES.COMPLETED);
    expect(a.canTransitionTo(ATTEMPT_STATUSES.EVALUATING)).toBe(false);
  });

  it('FAILED can retry (transition to EVALUATING)', () => {
    const a = makeAttempt(ATTEMPT_STATUSES.FAILED);
    expect(a.canTransitionTo(ATTEMPT_STATUSES.EVALUATING)).toBe(true);
  });
});
