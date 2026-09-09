const express = require('express');
const router = express.Router();

const { getProblems, getProblem } = require('../controllers/problemController');
const {
  createAttempt, getAttempt, getAttemptsByProblem,
  getHistory, saveDraft, submitSolution,
} = require('../controllers/attemptController');
const { getSubmission } = require('../controllers/submissionController');
const { getEvaluation, retryEvaluation } = require('../controllers/evaluationController');

// Async wrapper to catch errors
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Problems
router.get('/problems', wrap(getProblems));
router.get('/problems/:id', wrap(getProblem));

// Attempts
router.post('/problems/:problemId/attempts', wrap(createAttempt));
router.get('/problems/:problemId/attempts', wrap(getAttemptsByProblem));
router.get('/attempts/:attemptId', wrap(getAttempt));

// Submissions (via attempt)
router.post('/attempts/:attemptId/draft', wrap(saveDraft));
router.post('/attempts/:attemptId/submit', wrap(submitSolution));

// Direct submission fetch
router.get('/submissions/:submissionId', wrap(getSubmission));

// Evaluations
router.get('/evaluations/:evaluationId', wrap(getEvaluation));
router.post('/evaluations/:evaluationId/retry', wrap(retryEvaluation));

// History
router.get('/history', wrap(getHistory));

module.exports = router;
