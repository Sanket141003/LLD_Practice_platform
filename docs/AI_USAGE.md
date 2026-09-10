# AI Usage — LLD Practice Platform

This document covers 5 meaningful AI-assisted decisions made during the development of this project.

---

## Decision 1 — Evaluator Abstraction Architecture

**What AI suggested:**
When asked about evaluation architecture, AI suggested creating an `Evaluator` interface with concrete implementations (`AIEvaluator`, `RuleBasedEvaluator`) and a separate `AIProvider` abstraction to decouple the evaluator from any specific AI SDK.

**What I accepted:**
The two-level abstraction: `Evaluator → AIEvaluator → AIProvider → GeminiProvider`. This cleanly separates the evaluation domain logic from the infrastructure concern of which AI model to call.

**What I rejected:**
AI also suggested using an event-driven architecture with a message queue for evaluation jobs. Rejected for the MVP — the assignment explicitly warns against over-engineering into distributed systems. An in-process async call with a documented limitation is the right trade-off for a 2-day build.

**Final implementation:**
`EvaluatorFactory` selects the evaluator. `AIEvaluator` constructs the prompt and delegates to `AIProvider`. `GeminiProvider` wraps the Google Gemini SDK. Swapping providers or evaluator types requires changes only to the factory and the new concrete class. The abstraction also allowed switching from OpenAI to Gemini (free tier) without touching any domain or service layer code.

---

## Decision 2 — Submission Format Design

**What AI suggested:**
AI suggested supporting three submission formats from the start: structured text, code editor (with Monaco editor), and UML diagram (with draw.io or Mermaid.js integration).

**What I rejected:**
All formats except structured text for the MVP. The assignment is a 2-day build and the goal is demonstrating domain design, not building a multi-format editor. Structured text provides sufficient evidence for AI evaluation without the implementation overhead.

**Why the rejection was correct:**
The product value (explainable feedback on design thinking) does not depend on which format is used. Text forces the learner to articulate their design explicitly, which is itself a learning activity.

**Final implementation:**
`Submission.format` accepts `'TEXT'`, `'CODE'`, `'DIAGRAM'` as an enum (future extensibility), but only `'TEXT'` is implemented. The domain is shaped for future expansion without implementing it.

---

## Decision 3 — AI Evaluation Output Format

**What AI suggested (initial version):**
AI's first suggestion was a simple prompt: "Evaluate this LLD design and give a score from 0 to 100."

**What I rejected:**
A simple score is useless for learning. A learner seeing "Score: 73" has no idea what to improve. This completely misses the product goal.

**What I implemented instead:**
A structured JSON schema with per-criterion breakdown: `{ criterion, score, evidence, concern, suggestion, confidence }`. The `evidence` field forces the AI to cite the learner's actual submission. The `concern` and `suggestion` fields provide actionable guidance. The `confidence` field indicates how certain the AI is about each criterion.

**Why this matters:**
The evaluation prompt explicitly instructs the AI: "Do NOT compare the learner against one reference solution. Cite evidence from the learner's submission. Do not invent claims not present in the submission." This prevents hallucination and makes the feedback traceable.

---

## Decision 4 — Deterministic Validation Before AI

**What AI suggested:**
Send all submissions directly to the AI for evaluation, letting the AI decide if the submission is too thin.

**What I rejected:**
Delegating basic validation to the AI wastes API calls and introduces non-determinism into a simple check. An empty "Classes" section should be rejected immediately with a clear error message, not sent to Gemini for a judgment.

**Final implementation:**
`SubmissionService.finalizeSubmission()` runs `validateSubmissionContent()` before any AI call. Three sections are required (`requirementsUnderstanding`, `classes`, `responsibilities`) with a minimum word count. At least 5 of 10 sections must have content. Only submissions passing deterministic validation reach the AI.

---

## Decision 5 — AI Provider Choice and Demo Mode Design

**What AI suggested:**
Use OpenAI (paid) as the only AI provider and mock it via environment variables for demo mode.

**What I rejected:**
OpenAI requires a paid API key which creates a barrier for reviewers. Mocking the SDK directly makes the code harder to test and reason about.

**What I implemented instead:**
Two separate decisions:

1. **Gemini as the AI provider** — Google Gemini's free tier (`gemini-3.7-flash`) provides sufficient quality for LLD evaluation without requiring a paid account. The `AIProvider` abstraction means switching back to OpenAI or any other provider is a one-line change in `EvaluatorFactory`.

2. **A proper `DemoEvaluator` class** — implements the `Evaluator` interface and returns realistic mock feedback without any API call. When `DEMO_MODE=true`, `EvaluatorFactory` returns a `DemoEvaluator`. The demo banner in the UI clearly indicates the feedback is not real AI output. This approach respects the evaluator abstraction and makes the demo experience honest and obvious.

**Key insight from the AIProvider abstraction:**
When we needed to switch from OpenAI to Gemini, zero domain code changed. Only `GeminiProvider` was added and `EvaluatorFactory` was updated. This validated the architecture decision upfront.
