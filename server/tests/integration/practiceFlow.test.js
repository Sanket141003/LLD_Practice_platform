require('dotenv').config();
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../src/app');
const Problem = require('../../src/domain/problem/Problem');
const Attempt = require('../../src/domain/attempt/Attempt');
const Submission = require('../../src/domain/submission/Submission');
const Evaluation = require('../../src/domain/evaluation/Evaluation');
const problems = require('../../src/infrastructure/database/seedData');

// Force demo mode for integration tests
process.env.DEMO_MODE = 'true';

const MONGO_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/lld-practice-test';

let problemId;

beforeAll(async () => {
  await mongoose.connect(MONGO_URI);
  await Problem.deleteMany({});
  await Attempt.deleteMany({});
  await Submission.deleteMany({});
  await Evaluation.deleteMany({});

  const [inserted] = await Problem.insertMany([problems[0]]);
  problemId = inserted._id.toString();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

const validContent = {
  requirementsUnderstanding: 'The system must handle parking lots with multiple floors and multiple vehicle types including car truck motorcycle',
  assumptions: 'Single location parking lot with one entry and exit gate',
  classes: 'ParkingLot ParkingFloor ParkingSpot Vehicle Motorcycle Car Truck Ticket PricingStrategy',
  responsibilities: 'ParkingLot orchestrates overall operations. ParkingFloor manages its spots. PricingStrategy calculates fees.',
  relationships: 'ParkingLot has many ParkingFloors. ParkingFloor has many ParkingSpots. Vehicle extends to specific types.',
  flow: 'Vehicle arrives at gate, system finds available spot, generates ticket, vehicle parks. On exit, fee is calculated and ticket closed.',
  patterns: 'Strategy pattern for pricing. Factory pattern for vehicle creation.',
  edgeCases: 'Handle full lot by returning error. Handle invalid vehicle type.',
  extensibility: 'New vehicle types can be added by extending Vehicle class. New pricing rules via new Strategy implementation.',
  tradeoffs: 'Chose simplicity over real-time concurrency. For production would add distributed locking.',
};

describe('Full Practice Flow Integration', () => {
  let attemptId;
  let evaluationId;

  it('GET /api/problems returns the seeded problem', async () => {
    const res = await request(app).get('/api/problems');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/problems/:id returns problem detail', async () => {
    const res = await request(app).get(`/api/problems/${problemId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Parking Lot System');
  });

  it('POST /api/problems/:id/attempts creates an attempt', async () => {
    const res = await request(app)
      .post(`/api/problems/${problemId}/attempts`)
      .set('x-learner-id', 'test-learner');

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('DRAFT');
    expect(res.body.data.attemptNumber).toBe(1);
    attemptId = res.body.data._id;
  });

  it('POST /api/attempts/:id/draft saves draft without evaluation', async () => {
    const res = await request(app)
      .post(`/api/attempts/${attemptId}/draft`)
      .send({ content: { requirementsUnderstanding: 'partial work in progress...' } });

    expect(res.status).toBe(200);
    expect(res.body.data.isDraft).toBe(true);
  });

  it('POST /api/attempts/:id/submit with incomplete content returns 422', async () => {
    const res = await request(app)
      .post(`/api/attempts/${attemptId}/submit`)
      .send({ content: { requirementsUnderstanding: 'too short' } });

    expect(res.status).toBe(422);
    expect(res.body.errors).toBeDefined();
  });

  it('POST /api/attempts/:id/submit with valid content starts evaluation', async () => {
    const res = await request(app)
      .post(`/api/attempts/${attemptId}/submit`)
      .send({ content: validContent });

    expect(res.status).toBe(201);
    expect(res.body.data.evaluation.status).toBe('EVALUATING');
    evaluationId = res.body.data.evaluation._id;
  });

  it('GET /api/evaluations/:id returns evaluation', async () => {
    const res = await request(app).get(`/api/evaluations/${evaluationId}`);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(evaluationId);
  });

  it('submitting again to the same attempt returns error', async () => {
    const res = await request(app)
      .post(`/api/attempts/${attemptId}/submit`)
      .send({ content: validContent });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already been submitted/i);
  });

  it('GET /api/history returns attempts', async () => {
    const res = await request(app)
      .get('/api/history')
      .set('x-learner-id', 'test-learner');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('second attempt increments attemptNumber', async () => {
    const res = await request(app)
      .post(`/api/problems/${problemId}/attempts`)
      .set('x-learner-id', 'test-learner');

    expect(res.status).toBe(201);
    expect(res.body.data.attemptNumber).toBe(2);
  });
});

describe('Error cases', () => {
  it('GET /api/problems/invalid-id returns 400', async () => {
    const res = await request(app).get('/api/problems/invalid-id');
    expect(res.status).toBe(400);
  });

  it('POST attempts for non-existent problem returns error', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).post(`/api/problems/${fakeId}/attempts`);
    expect(res.status).toBe(400);
  });

  it('GET non-existent evaluation returns 404', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/evaluations/${fakeId}`);
    expect(res.status).toBe(404);
  });
});
