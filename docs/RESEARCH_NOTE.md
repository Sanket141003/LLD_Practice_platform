# Research Note — LLD Practice Platform

## The Learner Problem

Low-Level Design practice is peculiar: it is easy to start but extremely difficult to self-evaluate. A learner can sketch a Parking Lot design in 30 minutes and have no reliable signal about whether their design is actually good.

The core difficulties:

**1. There is no single correct answer.**
Unlike algorithmic problems (which have a verifiable correct output), LLD problems have many valid solutions. A learner who uses a Service Locator instead of Dependency Injection may be wrong — or may have made a justified trade-off. A rubric-free evaluation tool cannot distinguish between the two.

**2. Feedback from peers or interviewers is scarce and inconsistent.**
Most learners practice by reading other people's GitHub solutions. This gives them a reference architecture but no feedback on their own reasoning. The gap between "I read the solution" and "I can design this myself" is exactly where learning breaks down.

**3. Existing tools focus on algorithmic problems.**
LeetCode, HackerRank, and similar platforms are excellent for data structures and algorithms. They provide no structured evaluation for class design, responsibilities, abstractions, or extensibility.

**4. The learning loop is absent.**
Even when a learner submits a design in an interview context, feedback is usually binary (passed/failed) and arrives too late to be actionable. There is no record of progress, no comparison across attempts.

---

## Existing Approaches Researched

**GitHub LLD repositories (e.g., ashishps1/awesome-low-level-design, tssovi/grokking-the-object-oriented-design-interview)**
These provide reference solutions for common LLD problems. Very useful as a learning reference. However: no submission mechanism, no feedback on the learner's own design, and the solutions are presented as the only correct approach.

**Grokking the Object-Oriented Design Interview (Educative.io)**
A structured course covering LLD problems with UML-focused walkthroughs. Provides explanation of one reference solution per problem. No interactive practice loop, no learner submission, no feedback on individual work.

**Exponent / interviewing.io (mock interview platforms)**
Allow booking mock interviews with ex-FAANG engineers. Provides human feedback, but expensive, time-limited, and asynchronous. Not suitable for daily practice. No programmatic evaluation.

**CodeSignal / Coderbyte assessment tools**
Primarily code execution and algorithm testing. No structured LLD evaluation support.

**Community discussions (Reddit r/cscareerquestions, r/leetcode)**
Learners frequently post their LLD designs asking for feedback. Responses are inconsistent — some highly detailed, most superficial. This is the current best available option for many learners.

---

## Key Gaps Identified

**Gap 1 — Explainable feedback is absent.**
Every tool either provides no feedback, a generic "good/bad" verdict, or a reference solution comparison. None explain *why* a design decision is strong or weak, or *what specifically* the learner could change.

**Gap 2 — Multiple valid designs are not accommodated.**
Tools that compare against a reference solution penalize alternative approaches that are equally valid. An evaluator that says "you should have used Strategy pattern" when the learner's approach was functionally sound is not useful.

**Gap 3 — The learning loop is missing.**
No tool tracks improvement over repeated attempts. Learners who try a problem three times have no structured record of whether they're improving in specific areas.

**Gap 4 — Score without evidence.**
Some AI tools return a numerical score. A score of "73/100" with no evidence from the submission is not actionable. The learner cannot identify which class is overloaded or which abstraction is missing.

---

## Product Direction

This MVP focuses on a tight, functional practice loop:

**Problem** → **Structured Practice** → **Submission** → **Evaluation** → **Feedback** → **History** → **Retry**

The key bets:

1. **Structured text is sufficient** for an MVP evaluation. It forces the learner to articulate their design in writing, which is itself a learning activity. Code or diagrams add implementation complexity without proportionally increasing signal for an MVP.

2. **Criterion-level feedback with evidence** is more valuable than an overall score. A learner needs to know "your Responsibilities section shows ParkingLot handles pricing, allocation, and ticket management — this violates SRP" — not "7.2/10".

3. **Tracking improvement over attempts** reinforces the learning loop. Seeing 6.2 → 7.1 → 8.4 across three attempts is motivating and diagnostic.

4. **AI evaluation with a fixed rubric** can produce consistent, explainable feedback. The rubric anchors the AI's judgment and prevents hallucination. Structured JSON output validates the response before storing.
