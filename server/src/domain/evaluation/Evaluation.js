const mongoose = require('mongoose');

const EVALUATION_STATUSES = {
  EVALUATING: 'EVALUATING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
};

// Embedded feedback per criterion — clear responsibility boundary
const feedbackItemSchema = new mongoose.Schema({
  criterion: { type: String, required: true },
  score: { type: Number, min: 0, max: 10, required: true },
  evidence: { type: String, default: '' },
  concern: { type: String, default: '' },
  suggestion: { type: String, default: '' },
  confidence: { type: Number, min: 0, max: 1, default: 0.8 },
}, { _id: false });

const evaluationSchema = new mongoose.Schema({
  submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
  attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attempt', required: true },
  status: {
    type: String,
    enum: Object.values(EVALUATION_STATUSES),
    default: EVALUATION_STATUSES.EVALUATING,
  },
  evaluatorType: { type: String, enum: ['AI', 'RULE_BASED', 'DEMO', 'HUMAN'], default: 'AI' },
  rubricVersion: { type: String, default: '1.0' },
  overallScore: { type: Number, min: 0, max: 10, default: null },
  summary: { type: String, default: '' },
  criteria: [feedbackItemSchema],
  strengths: [{ type: String }],
  priorityImprovements: [{ type: String }],
  errorMessage: { type: String, default: null },
  completedAt: { type: Date, default: null },
  failedAt: { type: Date, default: null },
}, { timestamps: true });

evaluationSchema.index({ submissionId: 1 });
evaluationSchema.index({ attemptId: 1 });

module.exports = mongoose.model('Evaluation', evaluationSchema);
module.exports.EVALUATION_STATUSES = EVALUATION_STATUSES;
