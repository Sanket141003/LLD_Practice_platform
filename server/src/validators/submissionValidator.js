/**
 * Deterministic validation for submission content.
 * Rejects incomplete submissions BEFORE calling the AI.
 */

const REQUIRED_SECTIONS = [
  { key: 'requirementsUnderstanding', label: 'Requirements Understanding', minWords: 10 },
  { key: 'classes', label: 'Classes / Interfaces', minWords: 10 },
  { key: 'responsibilities', label: 'Responsibilities', minWords: 10 },
];

const ALL_SECTIONS = [
  'requirementsUnderstanding',
  'assumptions',
  'classes',
  'responsibilities',
  'relationships',
  'flow',
  'patterns',
  'edgeCases',
  'extensibility',
  'tradeoffs',
];

function wordCount(text) {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function validateSubmissionContent(content) {
  if (!content || typeof content !== 'object') {
    return { valid: false, errors: ['Submission content is required'] };
  }

  const errors = [];

  // Required sections must have minimum content
  for (const section of REQUIRED_SECTIONS) {
    const count = wordCount(content[section.key]);
    if (count < section.minWords) {
      errors.push(
        `"${section.label}" must have at least ${section.minWords} words (found ${count})`
      );
    }
  }

  // At least 5 of 10 sections should have some content
  const filledSections = ALL_SECTIONS.filter(key => wordCount(content[key]) > 0);
  if (filledSections.length < 5) {
    errors.push(
      `Please fill at least 5 sections. Currently only ${filledSections.length} section(s) have content.`
    );
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validateSubmissionContent, wordCount };
