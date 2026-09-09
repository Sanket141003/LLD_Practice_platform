const AttemptService = require('../application/services/AttemptService');
const SubmissionService = require('../application/services/SubmissionService');
const EvaluationService = require('../application/services/EvaluationService');

async function createAttempt(req, res) {
  const { problemId } = req.params;
  const learnerId = req.headers['x-learner-id'] || 'anonymous';

  const attempt = await AttemptService.createAttempt(problemId, learnerId);
  console.log(`[Attempt] Created attempt ${attempt._id} for problem ${problemId}`);
  res.status(201).json({ success: true, data: attempt });
}

async function getAttempt(req, res) {
  const attempt = await AttemptService.getAttemptById(req.params.attemptId);
  if (!attempt) {
    return res.status(404).json({ success: false, message: 'Attempt not found' });
  }
  res.json({ success: true, data: attempt });
}

async function getAttemptsByProblem(req, res) {
  const { problemId } = req.params;
  const learnerId = req.headers['x-learner-id'] || 'anonymous';
  const attempts = await AttemptService.getAttemptsByProblem(problemId, learnerId);
  res.json({ success: true, data: attempts });
}

async function getHistory(req, res) {
  const learnerId = req.headers['x-learner-id'] || 'anonymous';
  const attempts = await AttemptService.getHistory(learnerId);
  res.json({ success: true, data: attempts });
}

async function saveDraft(req, res) {
  const { attemptId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ success: false, message: 'Content is required' });
  }

  const submission = await SubmissionService.saveDraft(attemptId, content);
  res.json({ success: true, data: submission });
}

async function submitSolution(req, res) {
  const { attemptId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ success: false, message: 'Content is required' });
  }

  const submission = await SubmissionService.finalizeSubmission(attemptId, content);
  console.log(`[Submission] Created submission ${submission._id} for attempt ${attemptId}`);

  // Trigger evaluation (async — does not block response)
  const evaluation = await EvaluationService.startEvaluation(attemptId);
  console.log(`[Evaluation] Started evaluation ${evaluation._id}`);

  res.status(201).json({
    success: true,
    data: { submission, evaluation },
  });
}

module.exports = {
  createAttempt,
  getAttempt,
  getAttemptsByProblem,
  getHistory,
  saveDraft,
  submitSolution,
};
