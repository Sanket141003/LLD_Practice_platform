require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../../config');
const Problem = require('../../domain/problem/Problem');
const problems = require('./seedData');

async function seed() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Clear existing problems
    await Problem.deleteMany({});
    console.log('[Seed] Cleared existing problems');

    const inserted = await Problem.insertMany(problems);
    console.log(`[Seed] Inserted ${inserted.length} problems:`);
    inserted.forEach(p => console.log(`  - ${p.title} (${p.difficulty})`));

    console.log('[Seed] Done!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error:', err.message);
    process.exit(1);
  }
}

seed();
