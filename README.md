# LLD Practice Platform

A focused practice platform for Low-Level Design. Choose a problem, design a solution, get AI-powered criterion-level feedback, and track improvement across attempts.

## Overview

**Learner journey:** Choose Problem → Think & Design → Submit → Get Feedback → Review → Try Again

The platform evaluates your design across 10 criteria (responsibilities, coupling, extensibility, edge cases, etc.) and returns specific evidence from your submission alongside actionable improvement suggestions.

## Features

- 5 LLD problems: Parking Lot, Vending Machine, Elevator, Library Management, Movie Ticket Booking
- 10-section structured text editor with draft saving
- Deterministic validation before AI is called (rejects incomplete submissions early)
- AI evaluation via OpenAI with per-criterion scores, evidence, concerns, and suggestions
- Explicit evaluation state machine: DRAFT → SUBMITTED → EVALUATING → COMPLETED / FAILED
- Attempt history grouped by problem with score progression (e.g., 6.2 → 7.1 → 8.4)
- Retry on evaluation failure (submission is always preserved)
- Demo mode — full flow without an API key
- Extensible evaluator architecture (AI, Rule-Based, Demo, Human-ready)
- Extensible submission format (Text implemented; Code and Diagram hooks in place)

## Tech Stack

**Frontend:** React 18, Vite, React Router 6, Axios  
**Backend:** Node.js, Express.js, REST API  
**Database:** MongoDB + Mongoose  
**AI:** OpenAI API (GPT-4o-mini by default), abstracted behind `AIProvider`  
**Testing:** Jest + Supertest (backend), Vitest + React Testing Library (frontend)

## Architecture

```
AttemptService
      ↓
EvaluationService
      ↓
EvaluatorFactory
      ↓
Evaluator (abstract)
   ├── AIEvaluator
   │      ↓
   │   AIProvider (abstract)
   │      ↓
   │   OpenAIProvider → OpenAI API
   ├── RuleBasedEvaluator
   └── DemoEvaluator
```

## Domain Model

```
Problem → Attempt → Submission → Evaluation (embeds criteria[])
```

Every attempt preserves its own submission and evaluation. Retrying a problem creates a new attempt — old ones are never overwritten.

## Local Setup

### Prerequisites

- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)
- OpenAI API key (or use `DEMO_MODE=true`)

### 1. Clone and install

```bash
git clone https://github.com/your-username/lld-practice-platform
cd lld-practice-platform

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure environment variables

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lld-practice
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
CLIENT_URL=http://localhost:5173
NODE_ENV=development
DEMO_MODE=false
```

To run without an OpenAI key, set `DEMO_MODE=true`.

### 3. Seed the database

```bash
cd server
npm run seed
```

This inserts 5 LLD problems with full rubrics.

### 4. Start the backend

```bash
cd server
npm run dev
```

Server runs on http://localhost:5000

### 5. Start the frontend

```bash
cd client
npm run dev
```

App runs on http://localhost:5173

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/lld-practice` |
| `OPENAI_API_KEY` | OpenAI API key | — |
| `OPENAI_MODEL` | Model to use | `gpt-4o-mini` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `NODE_ENV` | Environment | `development` |
| `DEMO_MODE` | Use mock evaluator (no API key needed) | `false` |

## Running Tests

```bash
# Backend unit tests
cd server
npm run test:unit

# Backend integration tests (requires MongoDB)
cd server
npm run test:integration

# All backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## API Documentation

### Problems
```
GET  /api/problems          — List all active problems
GET  /api/problems/:id      — Get problem by ID
```

### Attempts
```
POST /api/problems/:problemId/attempts    — Create new attempt
GET  /api/attempts/:attemptId             — Get attempt (with populated problem)
GET  /api/problems/:problemId/attempts    — Get attempts for a problem
```

### Submissions
```
POST /api/attempts/:attemptId/draft       — Save draft (no evaluation)
POST /api/attempts/:attemptId/submit      — Finalize and start evaluation
GET  /api/submissions/:submissionId       — Get submission by ID
```

### Evaluations
```
GET  /api/evaluations/:evaluationId       — Get evaluation result
POST /api/evaluations/:evaluationId/retry — Retry a failed evaluation
```

### History
```
GET  /api/history                         — Get all attempts (learner identified by x-learner-id header)
```

All responses: `{ success: boolean, data: any, message?: string, errors?: string[] }`

## Deployment

### MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Add a database user and whitelist your IP (or 0.0.0.0/0 for open access)
3. Get the connection string: `mongodb+srv://user:pass@cluster.mongodb.net/lld-practice`

### Backend (Render)

1. Push code to GitHub
2. Create a new Web Service on [render.com](https://render.com)
3. Root directory: `server`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables in Render dashboard (see table above)
7. Set `CLIENT_URL` to your Vercel frontend URL

After deploy, seed the database:
```bash
MONGODB_URI=your-atlas-uri node src/infrastructure/database/seed.js
```

### Frontend (Vercel)

1. Create project on [vercel.com](https://vercel.com)
2. Root directory: `client`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-render-url.onrender.com/api`

### CORS Configuration

In `server/.env` on Render, set:
```
CLIENT_URL=https://your-project.vercel.app
```

The `cors` middleware uses this value directly.

### Production Build Test

```bash
# Test frontend build locally
cd client
npm run build
npm run preview
```

## Design Decisions

**Structured text only (MVP):** Provides enough evidence for AI evaluation while keeping implementation focused. The `format` field in `Submission` is already extensible for future formats.

**Async evaluation:** The HTTP response returns immediately after saving the submission and creating an evaluation record. AI runs asynchronously. This means the submission is never lost even if the AI call fails.

**Deterministic validation first:** Required sections (`requirementsUnderstanding`, `classes`, `responsibilities`) must have minimum word counts before any AI call. This prevents wasted API calls and gives clear feedback on what's missing.

**Fixed rubric + structured AI output:** The AI receives a fixed rubric and is required to return structured JSON. The response is validated before storing. This prevents hallucination, makes feedback consistent, and ensures every evaluation has the same shape.

**Anonymous learner ID:** A UUID is generated and stored in localStorage on first visit. Simple, no auth required for MVP. Clearly documented as a limitation.

## Trade-offs

| Decision | What was sacrificed |
|---|---|
| Structured text only | Less design evidence than code or diagrams |
| Anonymous ID in localStorage | Not portable across devices/browsers |
| In-process async evaluation | No guaranteed job delivery on server restart |
| Embedded feedback in Evaluation | Harder to query individual feedback items at scale |

## Known Limitations

- Learner identity is browser-local (localStorage UUID). Switching browsers loses history.
- If the server restarts while an evaluation is `EVALUATING`, the status stays stuck. The learner can retry from the UI.
- No rate limiting on evaluation — a user could create many attempts and trigger many AI calls.
- History is not paginated (acceptable for MVP scale).

## Future Improvements

- Authentication (JWT or OAuth) for persistent learner identity
- Code submission support (Monaco editor + code evaluation criteria)
- Diagram submission (Mermaid.js or draw.io export)
- Human review evaluator
- Proper job queue (BullMQ + Redis) for reliable async evaluation
- Score comparison charts across attempts
- Problem difficulty progression tracking
- Rubric versioning with impact analysis on historical scores

## AI Usage

See [docs/AI_USAGE.md](docs/AI_USAGE.md) for 5 documented AI-assisted decisions including what was accepted, rejected, and why.
