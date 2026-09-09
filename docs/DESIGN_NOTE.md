# Design Note — LLD Practice Platform

## 1. Product Goal

Build a focused practice platform where a learner can:
- Attempt LLD problems using a structured 10-section text format
- Submit a solution and receive AI-powered criterion-level feedback
- Track improvement across multiple attempts per problem

The learner journey: **Choose → Design → Submit → Feedback → History → Retry**

---

## 2. MVP Scope

- 5 LLD problems (Parking Lot, Vending Machine, Elevator, Library, Movie Ticket)
- Structured text submission (10 sections)
- Deterministic validation before AI evaluation
- AI-powered evaluation with 10 criteria, scores, evidence, concerns, suggestions
- Attempt history with score progression
- Demo mode for reviewers without an API key

---

## 3. User Flow

```
Home → Problems List → Problem Detail → Start Practice
  → Practice Editor (10 sections) → Save Draft (anytime)
  → Submit → Evaluation (EVALUATING state → polling)
  → Feedback (score, criteria, strengths, suggestions)
  → History → Attempt Detail → Try Again
```

---

## 4. Domain Model

```
Problem
  ├── title, description, difficulty
  ├── requirements[], constraints[], expectedConsiderations[]
  └── rubric[] (criterion, weight, description)

Attempt
  ├── problemId → Problem
  ├── learnerId (anonymous for MVP)
  ├── status: DRAFT | SUBMITTED | EVALUATING | COMPLETED | FAILED
  ├── attemptNumber (auto-incremented per learner+problem)
  ├── submissionId → Submission
  └── evaluationId → Evaluation

Submission
  ├── attemptId → Attempt
  ├── format: TEXT (extensible to CODE, DIAGRAM)
  ├── content: { requirementsUnderstanding, assumptions, classes,
  │              responsibilities, relationships, flow, patterns,
  │              edgeCases, extensibility, tradeoffs }
  ├── isDraft: boolean
  └── version: number

Evaluation
  ├── submissionId → Submission
  ├── attemptId → Attempt
  ├── status: EVALUATING | COMPLETED | FAILED
  ├── evaluatorType: AI | RULE_BASED | DEMO
  ├── overallScore: 0–10
  ├── summary: string
  ├── criteria[]: { criterion, score, evidence, concern, suggestion, confidence }
  ├── strengths[]: string[]
  └── priorityImprovements[]: string[]
```

---

## 5. Class Responsibilities

| Class | Responsibility |
|---|---|
| Problem | Owns problem statement, requirements, rubric. No behavior beyond data. |
| Attempt | Owns status lifecycle for one practice session. Enforces valid transitions. |
| Submission | Owns the learner's solution content. Format-agnostic at the domain level. |
| Evaluation | Owns evaluation results. Stores AI output. Manages retry state. |
| AttemptService | Orchestrates attempt creation and status transitions. |
| SubmissionService | Validates and persists submissions. Rejects invalid content deterministically. |
| EvaluationService | Starts evaluation, stores result, handles async execution and failure. |
| Evaluator (abstract) | Contract for any evaluator (AI, rule-based, human, demo). |
| AIEvaluator | Constructs prompt, calls AIProvider, parses and validates AI response. |
| AIProvider (abstract) | Contract for any AI model provider. |
| OpenAIProvider | Implements AIProvider using the OpenAI SDK. |
| DemoEvaluator | Returns deterministic mock feedback. Used when DEMO_MODE=true. |
| EvaluatorFactory | Selects and constructs the appropriate evaluator. |

---

## 6. Key Interfaces

```javascript
// Evaluator interface
class Evaluator {
  async evaluate(submission, problem): Promise<EvaluationResult>
  getType(): string
}

// AIProvider interface
class AIProvider {
  async complete(systemPrompt, userPrompt): Promise<string>
}

// EvaluationResult shape
{
  overallScore: number,        // 0–10
  summary: string,
  criteria: CriterionFeedback[],
  strengths: string[],
  priorityImprovements: string[]
}

// CriterionFeedback shape
{
  criterion: string,
  score: number,         // 0–10
  evidence: string,
  concern: string,
  suggestion: string,
  confidence: number     // 0–1
}
```

---

## 7. Evaluation Architecture

```
POST /attempts/:id/submit
  ↓
SubmissionService.finalizeSubmission()
  ↓ deterministic validation (reject if required sections missing)
  ↓
EvaluationService.startEvaluation()
  ↓ create Evaluation record (status=EVALUATING) — submission is SAFE
  ↓ return HTTP 201 immediately
  ↓ (async)
EvaluatorFactory.create('AI')
  ↓
AIEvaluator.evaluate(submission, problem)
  ↓
AIProvider.complete(systemPrompt, userPrompt)
  ↓
OpenAIProvider → OpenAI API
  ↓
parse + validate JSON response
  ↓
Evaluation.status = COMPLETED
```

If the AI fails at any point:
```
Evaluation.status = FAILED (with errorMessage)
Attempt.status = FAILED
→ User can retry from UI
```

---

## 8. Deterministic vs AI Evaluation

| Check | Evaluator |
|---|---|
| Required sections present | Deterministic (SubmissionService) |
| Minimum word count per section | Deterministic |
| Minimum total sections filled | Deterministic |
| Duplicate submission detection | Deterministic (EvaluationService) |
| Valid attempt state | Deterministic (AttemptService) |
| Quality of responsibilities | AI |
| Coupling and cohesion analysis | AI |
| Design pattern appropriateness | AI |
| Extensibility assessment | AI |
| Edge case coverage | AI |
| Explanation quality | AI |
| Trade-off analysis | AI |

---

## 9. Evaluation State Machine

```
              DRAFT
                ↓ (finalize submission)
           SUBMITTED
                ↓ (start evaluation)
           EVALUATING
            ↙        ↘
       COMPLETED     FAILED
                       ↓ (retry)
                   EVALUATING
```

Invalid transitions (e.g., COMPLETED → EVALUATING) are explicitly rejected by `canTransitionTo()` on the Attempt model.

---

## 10. Failure Handling

| Failure | Behavior |
|---|---|
| AI API timeout | Evaluation → FAILED, submission preserved |
| Malformed AI JSON | Parsed and validated; throws on missing required fields |
| AI returns impossible scores | Scores clamped to 0–10 range |
| Duplicate evaluation attempt | Returns existing evaluation (idempotent) |
| User refreshes during evaluation | Frontend polls every 3s until COMPLETED or FAILED |
| Empty submission | Rejected with 422 before AI is called |
| Network error on client | ErrorMessage component shown, retry available |

---

## 11. Submission Format Extensibility (Change Test A)

The `format` field and `content` schema are the only submission-aware pieces. Adding `CodeSubmission`:
1. Add `'CODE'` to format enum in Submission model
2. Add a `codeContent` schema or extend the content object
3. Update `SubmissionService.validateContent()` for code-specific rules
4. Update the practice editor to support code input

No changes to: `AttemptService`, `EvaluationService`, `Evaluator` interface, or any evaluator implementation.

---

## 12. Evaluator Extensibility (Change Test B)

Adding a `HumanEvaluator`:
1. Create `HumanEvaluator extends Evaluator` with a queue-based flow
2. Add `'HUMAN'` to `EvaluatorFactory.create()`
3. Add routing logic in `EvaluatorFactory.getDefaultType()` if needed

No changes to: `EvaluationService._runEvaluation()`, `AttemptService`, or any frontend page.

---

## 13. Database Design

Collections: `problems`, `attempts`, `submissions`, `evaluations`

Feedback is embedded within `Evaluation` (as `criteria[]`) rather than in a separate collection. For the MVP, this is simpler and sufficient. A separate `Feedback` collection would be useful if feedback items needed independent querying or if multiple feedback rounds per evaluation were supported.

Indexes:
- `attempts`: `(problemId, learnerId)`, `(learnerId, createdAt)`
- `submissions`: `attemptId`
- `evaluations`: `submissionId`, `attemptId`
- `problems`: `slug`

---

## 14. API Design

All responses follow: `{ success: boolean, data: any, message?: string, errors?: string[] }`

See README for full API documentation.

---

## 15. Trade-offs

| Decision | Trade-off |
|---|---|
| Embedded feedback vs separate collection | Simpler queries vs. harder to paginate/filter individually |
| Anonymous learner ID (localStorage) | No auth complexity vs. no data portability across devices |
| Async evaluation (fire-and-forget) | Non-blocking vs. no guaranteed delivery without a queue |
| Structured text only | Fast to build + evaluate vs. less evidence than code or diagrams |
| Single rubric version per problem | Simple versioning vs. can't compare across rubric changes |

---

## 16. Scaling Considerations

For the MVP, a single Node.js process handles everything. If evaluation volume grows:

**The first component to separate would be the evaluation worker**, because:
- AI evaluation is slow (5–30s) and independently scalable
- A background queue (BullMQ + Redis) would allow multiple workers
- The main API would remain fast, enqueuing jobs rather than running them in-process

This separation would require:
1. Replacing the in-process `setTimeout`-based async with a proper job queue
2. A worker process that dequeues and runs evaluations
3. WebSocket or server-sent events for real-time status (currently polling)

No changes to the domain model or evaluator abstraction would be needed.

---

## 17. Known Limitations

- Anonymous learner ID is stored in `localStorage` — not portable across browsers/devices
- In-process async evaluation: if the server restarts mid-evaluation, the job is lost (submission is safe, evaluation status = EVALUATING forever → user can retry manually)
- No rate limiting on AI evaluation (one per submission is enforced, but a learner could create many submissions)
- No pagination on history (acceptable for MVP, add for scale)
- Rubric is problem-level but not versioned per evaluation — changing a rubric affects historical comparisons
