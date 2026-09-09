const Problem = require('../../domain/problem/Problem');

class ProblemService {
  async getAllProblems() {
    return Problem.find({ isActive: true })
      .select('title slug description difficulty category requirements constraints expectedConsiderations rubric rubricVersion createdAt')
      .sort({ createdAt: 1 });
  }

  async getProblemById(id) {
    const problem = await Problem.findById(id);
    if (!problem || !problem.isActive) return null;
    return problem;
  }

  async getProblemBySlug(slug) {
    const problem = await Problem.findOne({ slug, isActive: true });
    return problem;
  }
}

module.exports = new ProblemService();
