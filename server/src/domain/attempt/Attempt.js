const mongoose = require('mongoose');

// Valid statuses and allowed transitions
const ATTEMPT_STATUSES = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  EVALUATING: 'EVALUATING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
};

const VALID_TRANSITIONS = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['EVALUATING'],
  EVALUATING: ['COMPLETED', 'FAILED'],
  COMPLETED: [], // terminal
  FAILED: ['EVALUATING'], // allow retry
};

const attemptSchema = new mongoose.Schema({
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  // userId: future auth support
  learnerId: { type: String, default: 'anonymous' },
  status: {
    type: String,
    enum: Object.values(ATTEMPT_STATUSES),
    default: ATTEMPT_STATUSES.DRAFT,
  },
  attemptNumber: { type: Number, required: true, min: 1 },
  submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', default: null },
  evaluationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Evaluation', default: null },
  submittedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

attemptSchema.index({ problemId: 1, learnerId: 1 });
attemptSchema.index({ learnerId: 1, createdAt: -1 });

/**
 * Validates whether a status transition is allowed.
 */
attemptSchema.methods.canTransitionTo = function (newStatus) {
  const allowed = VALID_TRANSITIONS[this.status] || [];
  return allowed.includes(newStatus);
};

module.exports = mongoose.model('Attempt', attemptSchema);
module.exports.ATTEMPT_STATUSES = ATTEMPT_STATUSES;
