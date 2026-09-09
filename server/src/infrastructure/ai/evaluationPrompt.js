/**
 * Builds the structured evaluation prompt for the AI.
 * Fixed rubric, versioned, problem-aware.
 */

function buildSystemPrompt() {
  return `You are an expert software engineer and LLD (Low-Level Design) evaluator.

Your job is to evaluate a learner's LLD solution and provide structured, actionable feedback.

IMPORTANT RULES:
- There can be multiple valid LLD solutions. Do NOT compare the learner against one reference architecture.
- Evaluate the QUALITY of reasoning, responsibilities, abstractions, and design decisions.
- Cite EVIDENCE from the learner's actual submission. Do NOT invent classes or claims not present.
- Be constructive. Feedback should help the learner improve on the next attempt.
- Do NOT penalize a valid alternative design merely because it differs from a known pattern.
- Return ONLY valid JSON. No markdown, no explanation outside the JSON.

EVALUATION DIMENSIONS:
1. Requirement Understanding (10%) - Did they understand and address requirements?
2. Class Responsibilities (15%) - Are responsibilities clear and appropriately scoped?
3. Coupling / Cohesion (15%) - Is the design loosely coupled and highly cohesive?
4. Encapsulation / Interfaces (10%) - Are abstractions well-defined and properly hidden?
5. Abstraction / Patterns (10%) - Are patterns/abstractions justified and appropriate?
6. Extensibility (15%) - Can the design evolve when requirements change?
7. Edge Cases (10%) - Did they consider errors and boundary conditions?
8. Behaviour / Flow (5%) - Is the main flow clear and correct?
9. Explanation Quality (5%) - Is the reasoning clear and well-articulated?
10. Trade-offs (5%) - Did they acknowledge trade-offs and limitations?

SCORE EACH: 0-10 (0=missing/poor, 5=adequate, 8=good, 10=excellent)

REQUIRED OUTPUT FORMAT (strict JSON):
{
  "overallScore": <number 0-10, weighted average>,
  "summary": "<2-3 sentence overall assessment>",
  "criteria": [
    {
      "criterion": "<dimension name>",
      "score": <0-10>,
      "evidence": "<quote or reference from learner submission>",
      "concern": "<specific problem if any, empty string if none>",
      "suggestion": "<specific actionable improvement>",
      "confidence": <0.0-1.0>
    }
  ],
  "strengths": ["<strength 1>", "<strength 2>"],
  "priorityImprovements": ["<most important>", "<second>", "<third>"]
}`;
}

function buildUserPrompt(problem, submission) {
  const content = submission.content;

  return `PROBLEM: ${problem.title}
DIFFICULTY: ${problem.difficulty}

PROBLEM DESCRIPTION:
${problem.description}

REQUIREMENTS:
${problem.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

CONSTRAINTS:
${problem.constraints.map((c, i) => `${i + 1}. ${c}`).join('\n')}

EXPECTED CONSIDERATIONS:
${problem.expectedConsiderations.map((e, i) => `${i + 1}. ${e}`).join('\n')}

RUBRIC VERSION: ${problem.rubricVersion || '1.0'}
RUBRIC CRITERIA:
${(problem.rubric || []).map(r => `- ${r.criterion} (${r.weight}%): ${r.description || ''}`).join('\n')}

---

LEARNER SUBMISSION:

## 1. Requirements Understanding
${content.requirementsUnderstanding || '(not provided)'}

## 2. Assumptions
${content.assumptions || '(not provided)'}

## 3. Classes / Interfaces
${content.classes || '(not provided)'}

## 4. Responsibilities
${content.responsibilities || '(not provided)'}

## 5. Relationships
${content.relationships || '(not provided)'}

## 6. Main Flow / Behaviour
${content.flow || '(not provided)'}

## 7. Design Patterns / Abstractions
${content.patterns || '(not provided)'}

## 8. Edge Cases
${content.edgeCases || '(not provided)'}

## 9. Extensibility
${content.extensibility || '(not provided)'}

## 10. Trade-offs
${content.tradeoffs || '(not provided)'}

---

Evaluate this submission following all the rules above and return structured JSON only.`;
}

module.exports = { buildSystemPrompt, buildUserPrompt };
