/**
 * Seeds problems only if the collection is empty.
 * Safe to call on every server start in production.
 */
const Problem = require('../../domain/problem/Problem');
const problems = require('./seedData');

async function seedIfEmpty() {
  const count = await Problem.countDocuments();
  if (count === 0) {
    await Problem.insertMany(problems);
    console.log(`[Seed] Inserted ${problems.length} problems`);
  }
}

module.exports = seedIfEmpty;
