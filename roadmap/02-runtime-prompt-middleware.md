# Spec 02: Runtime Prompt Middleware

> Status: **Roadmap (Future)**
> Priority: Medium
> Approach: SDK / service layer

## Overview

A runtime middleware that intercepts prompts **before they reach the LLM**, validates them against quality rules, and either rejects, rewrites, or annotates them — all using a free/cheap model as the validator.

## Problem (Same as Spec 01, Different Context)

In CI/CD, we catch bad prompt *templates*. But in production:
- Developers compose prompts dynamically at runtime
- User inputs are interpolated into prompt templates
- The final prompt may be good template + bad user input = bad prompt
- There's no PR to gate — the prompt goes straight to the expensive model

## Solution

A lightweight SDK that wraps the LLM call:

```python
from pipisoft_prompt_guard import PromptGuard

guard = PromptGuard(
    rules="pipisoft-rules.yaml",
    validator_model="gpt-4o-mini",  # Free/cheap
    target_model="gpt-4o",          # Expensive
)

# Instead of calling the model directly:
response = guard.complete(prompt)
# PromptGuard:
#   1. Validates prompt against rules using gpt-4o-mini
#   2. If valid → forwards to gpt-4o
#   3. If invalid → returns rejection with suggestions
```

## Architecture

```
Developer Code
      ↓
PromptGuard SDK
      ├── Rule Engine (YAML-based, same format as CI/CD)
      ├── Validator (gpt-4o-mini)
      │   ├── PASS → forward to target model
      │   ├── WARN → forward + log warning
      │   └── FAIL → reject + return suggestions
      └── Metrics (latency, rejection rate, quality score)
      ↓
Target LLM (gpt-4o, Claude, etc.)
```

## Key Design Principles

1. **Same rules format** as CI/CD (pipisoft-rules.yaml) — one source of truth
2. **Latency budget** — validator must respond in < 500ms (gpt-4o-mini is ~200ms)
3. **Configurable strictness** — PASS/WARN/FAIL thresholds per environment
4. **Observable** — metrics on rejection rate, quality distribution, latency overhead
5. **Opt-in** — teams can adopt incrementally

## API Surface

```python
# Configuration
guard = PromptGuard(rules, validator_model, target_model, strictness="warn")

# Simple usage
response = guard.complete(prompt)

# Advanced: just validate, don't forward
result = guard.validate(prompt)
# result.score = 0.85
# result.passed = True
# result.suggestions = []

# Batch validation (for CI/CD integration)
results = guard.validate_batch(prompts)
```

## Integration Points

| Integration | How |
|------------|-----|
| Python SDK | `pip install pipisoft-prompt-guard` |
| TypeScript SDK | `npm install @pipisoft/prompt-guard` |
| REST API | `POST /api/v1/validate` |
| GitHub Action | Uses same rules.yaml as CI/CD |
| VS Code Extension | Real-time prompt linting in editor |

## Cost Analysis

| Scenario | Without Guard | With Guard |
|----------|--------------|------------|
| 1000 prompts, 30% bad | 1000 × gpt-4o = $$ | 1000 × gpt-4o-mini + 700 × gpt-4o = ~70% cost |
| Token savings | 0 | ~30% fewer wasted expensive tokens |
| Quality | Unpredictable | Consistent baseline |

## Implementation Phases

### Phase 1: Validate Only
- Rule engine + validator
- Returns pass/fail + suggestions
- No auto-forwarding

### Phase 2: Guard + Forward
- Wraps target model calls
- Auto-reject or auto-forward based on score
- Metrics dashboard

### Phase 3: Rewrite
- Validator suggests improvements
- Auto-rewrite bad prompts before forwarding
- A/B test original vs rewritten

## Dependencies on Spec 01

- Shares `pipisoft-rules.yaml` format
- Shares rubric/grading logic
- CI/CD gate (Spec 01) validates prompt *templates*
- Runtime guard (this spec) validates *composed prompts*

## Open Questions

- Should the validator run async (non-blocking) or sync (blocking)?
- How to handle validator model downtime? (Fail-open vs fail-closed)
- Should rewritten prompts be logged for human review?
- Privacy: are prompts logged? Where? Retention policy?
