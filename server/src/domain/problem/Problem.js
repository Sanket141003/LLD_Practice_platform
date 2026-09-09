const mongoose = require('mongoose');

const rubricCriterionSchema = new mongoose.Schema({
  criterion: { type: String, required: true },
  weight: { type: Number, required: true }, // percentage weight, e.g. 15
  description: { type: String },
}, { _id: false });

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  category: { type: String, default: 'OOP' },
  requirements: [{ type: String }],
  constraints: [{ type: String }],
  expectedConsiderations: [{ type: String }],
  rubric: [rubricCriterionSchema],
  rubricVersion: { type: String, default: '1.0' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

problemSchema.index({ slug: 1 });
problemSchema.index({ difficulty: 1 });

module.exports = mongoose.model('Problem', problemSchema);
