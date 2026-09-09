const EvaluationService = require('../application/services/EvaluationService');

async function getEvaluation(req, res) {
  const evaluation = await EvaluationService.getEvaluationById(req.params.evaluationId);
  if (!evaluation) {
    return res.status(404).json({ success: false, message: 'Evaluation not found' });
  }
  res.json({ success: true, data: evaluation });
}

async function retryEvaluation(req, res) {
  const evaluation = await EvaluationService.retryEvaluation(req.params.evaluationId);
  res.json({ success: true, data: evaluation });
}

module.exports = { getEvaluation, retryEvaluation };
