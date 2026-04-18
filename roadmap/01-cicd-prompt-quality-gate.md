# Spec 01: CI/CD Prompt Quality Gate

> Status: **Implementing (POC)**
> Priority: High
> Approach: Extend existing promptfoo pipeline

## Overview

A CI/CD quality gate that evaluates **developer-written prompts** before they reach production, using a free LLM (gpt-4o-mini) as a judge. Runs alongside existing output-quality tests in the same PR pipeline.

## Problem

Developers write prompts that are:
- Too vague ("make this better")
- Missing context (no codebase info, no role assignment)
- Not targeting the right agent or skill
- Ignoring platform best practices (Claude XML tags, Copilot slash commands)
- Too long or too short for the task

Bad prompts → bad outputs → wasted tokens → unreliable AI workflows.

## Solution

Add a **prompt quality evaluation** phase to the existing promptfoo pipeline:

```
PR opened
  ↓
promptfoo eval runs:
  ├── Phase 1: Prompt Quality (NEW)
  │   └── gpt-4o-mini judges prompts against rubric
  └── Phase 2: Output Quality (EXISTING)
      └── Deterministic assertions on model responses
  ↓
PR comment shows both scores
```

## How It Works

### The Paradigm Flip

Traditional promptfoo: **prompt → model → output → assert on output**

Prompt quality gate: **prompt-under-test → model echoes it → llm-rubric judges the prompt itself**

The "prompt" template tells the model to echo back the input. The `llm-rubric` assertion then judges whether the echoed prompt follows best practices.

### Rubric Structure

The rubric evaluates prompts against:

1. **Universal Best Practices** (from Claude/Copilot docs)
   - Clarity and specificity
   - Context and role assignment
   - Use of examples (few-shot)
   - Structured formatting (XML tags, numbered steps)
   - Appropriate length for task complexity

2. **Company Rules** (from `fixtures/pipisoft-rules.yaml`)
   - References correct agent name
   - Specifies a valid skill
   - Includes codebase context when needed
   - Follows company prompt template

### Test Case Categories

| Category | Good Prompt (PASS) | Bad Prompt (FAIL) |
|----------|-------------------|-------------------|
| Vagueness | "Write a Python function that validates email addresses using regex, returning True for valid and False for invalid" | "fix the code" |
| Agent/Skill | "@pipisoft-codebot /code-review Review this Flask endpoint for SQL injection vulnerabilities" | "review my code please" |
| Context | "Given this Express.js middleware, refactor to use async/await. Current code: [attached]" | "refactor this" |
| Format | "Return only valid JSON with keys: name, type, description" | "give me some JSON or whatever format" |
| Length | Appropriate detail for task complexity | 2000-word essay for a simple rename |

## Configuration

```yaml
# In promptfoo.yaml
defaultTest:
  options:
    provider: github:openai/gpt-4o-mini  # Free judge model

tests:
  - file://test-cases/prompt-quality.yaml  # NEW
  - file://test-cases/coding-tasks.yaml    # EXISTING
  # ... other existing test files
```

## Success Criteria

- [ ] Good prompts score ≥ 80% on rubric
- [ ] Bad prompts score < 50% on rubric
- [ ] Clear separation between good and bad in results
- [ ] Runs in < 2 minutes alongside existing tests
- [ ] PR comment shows prompt quality score

## Future Enhancements

- Prompt rewriting suggestions (not just pass/fail)
- Codebase-aware validation (detect available APIs/skills from repo)
- Custom rubric per team/project
- Historical tracking of prompt quality trends
