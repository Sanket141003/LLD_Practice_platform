const mongoose = require('mongoose');

// Structured text content — the only submission format for MVP
// Designed so future formats (CodeSubmission, DiagramSubmission) can be added
// by extending the format field and adding new content schemas.

const textContentSchema = new mongoose.Schema({
  requirementsUnderstanding: { type: String, default: '' },
  assumptions: { type: String, default: '' },
  classes: { type: String, default: '' },
  responsibilities: { type: String, default: '' },
  relationships: { type: String, default: '' },
  flow: { type: String, default: '' },
  patterns: { type: String, default: '' },
  edgeCases: { type: String, default: '' },
  extensibility: { type: String, default: '' },
  tradeoffs: { type: String, default: '' },
}, { _id: false });

const submissionSchema = new mongoose.Schema({
  attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attempt', required: true },
  format: { type: String, enum: ['TEXT', 'CODE', 'DIAGRAM'], default: 'TEXT' },
  content: { type: textContentSchema, required: true },
  version: { type: Number, default: 1 },
  isDraft: { type: Boolean, default: true },
  submittedAt: { type: Date, default: null },
}, { timestamps: true });

submissionSchema.index({ attemptId: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
