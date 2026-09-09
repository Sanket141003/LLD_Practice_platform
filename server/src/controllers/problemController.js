const ProblemService = require('../application/services/ProblemService');

async function getProblems(req, res) {
  const problems = await ProblemService.getAllProblems();
  res.json({ success: true, data: problems });
}

async function getProblem(req, res) {
  const problem = await ProblemService.getProblemById(req.params.id);
  if (!problem) {
    return res.status(404).json({ success: false, message: 'Problem not found' });
  }
  res.json({ success: true, data: problem });
}

module.exports = { getProblems, getProblem };
