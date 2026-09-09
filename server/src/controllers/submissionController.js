const SubmissionService = require('../application/services/SubmissionService');

async function getSubmission(req, res) {
  const submission = await SubmissionService.getSubmissionById(req.params.submissionId);
  if (!submission) {
    return res.status(404).json({ success: false, message: 'Submission not found' });
  }
  res.json({ success: true, data: submission });
}

module.exports = { getSubmission };
