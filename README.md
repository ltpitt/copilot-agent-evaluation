# copilot-agent-evaluation

> **Making AI evals a habit** — a standard, repeatable way to measure Copilot and coding-agent quality before it reaches your engineers.

## Executive summary

| | |
|---|---|
| **What this is** | A standard framework for evaluating GitHub Copilot and other coding agents against quality, safety, and consistency benchmarks. |
| **Why it matters** | Unreviewed AI output at scale introduces risk. This framework gives engineering leaders a consistent signal so they can safely roll out Copilot to thousands of engineers with confidence. |
| **What it outputs** | Scorecards per model and per test category, plus regression detection so you know immediately when an update changes behaviour. |
| **Time to run** | ~60 seconds for the default test suite (2 models × 4 categories, run in parallel). |
| **How to adopt** | Fork or use this as a template repository, drop in your own test cases, and wire the included GitHub Actions workflow to run on every push or on a schedule. |

### Why make evals a habit?

Microsoft's [Agent Evaluation guidance](https://adoption.microsoft.com/files/agents/AgentEvaluationEbook.pdf) recommends treating AI evaluation the same way engineering teams treat automated testing: run it continuously, track scores over time, and use regressions as a quality gate. This repository embodies that approach:

- **Continuous** — runs on every pull request and on a scheduled cadence via GitHub Actions.
- **Comparable** — multiple models are evaluated side-by-side so you can swap providers with data, not gut feeling.
- **Extensible** — add new test cases in YAML; no code changes required.
- **Auditable** — results are stored as artifacts and can be published to a dashboard for stakeholder review.

---

Evaluate GitHub Copilot and other LLMs using [promptfoo](https://www.promptfoo.dev/).

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [promptfoo](https://www.promptfoo.dev/docs/getting-started/) installed globally or via npx
- A GitHub personal access token with `models:read` permission, exported as `GITHUB_TOKEN`

## Quickstart

```bash
# 1. Install promptfoo (if not already installed)
npm install -g promptfoo

# 2. Export your GitHub token
export GITHUB_TOKEN=your_github_token_here

# 3. Run the evaluation
bash scripts/run-local.sh

# 4. View the results in your browser
promptfoo view
```

## GitHub Actions integration

The included workflow (`.github/workflows/eval.yaml`) runs on every pull request:

1. **Runs the full evaluation suite** — `npx promptfoo eval --no-cache` so every run gets fresh model responses, making it possible to detect provider-side model updates.
2. **Posts a score summary comment** on the PR so reviewers see pass/fail at a glance without downloading logs.
3. **Blocks the merge** if any assertion fails (non-zero exit from promptfoo).

### Setup

Add a repository secret named **`GH_MODELS_TOKEN`** — a GitHub PAT with the `models:read` scope.  The auto-generated `GITHUB_TOKEN` does not carry this scope.

The auto-generated `GITHUB_TOKEN` is used automatically for posting PR comments (no extra setup needed).

### Example PR comment

```
## ✅ Copilot Agent Evaluation

✅ All tests passed — no model drift detected.

| | |
|---|---|
| Score | 100% (18/18 passed) |
```

## Model-drift detection

`test-cases/model-drift.yaml` contains five *drift gates* that guard against the
three most common silent regressions caused by model updates:

| Gate | Failure mode | Real-world impact |
|------|-------------|-------------------|
| Bare-code output | Model wraps bash in `` ``` `` fences | `exec()` receives fence characters and crashes |
| SQL-injection keyword | Model says "injection flaw" instead of "SQL injection" | String-based security scanner silently stops flagging vulnerabilities |
| Deprecation signal | Model says "legacy" instead of "deprecated" | PR-review bot stops surfacing deprecation badges |
| Anti-hallucination | Model invents a plausible-looking but fictional API signature | Engineers copy non-existent API calls into production code |
| Exact bullet count | Model adds a 4th "bonus" bullet | Slide-generation layout engine throws an index error |

Each test is deterministic (`contains`, `not-contains`, or `javascript`) — no LLM judge required — so results are reproducible and suitable as a hard quality gate.

## Project layout

```
.
├── .github/
│   └── workflows/
│       └── eval.yaml            # PR check: run evals, post comment, block on failure
├── promptfoo.yaml               # Main promptfoo configuration
├── test-cases/
│   ├── coding-tasks.yaml        # Code generation / completion prompts
│   ├── refactoring.yaml         # Code refactoring prompts
│   ├── security.yaml            # Security-focused prompts
│   ├── instruction-following.yaml  # Instruction-following / format prompts
│   └── model-drift.yaml         # Drift gates: catch model-update regressions on PR
├── fixtures/               # Tiny sample source files used by test cases
│   ├── Sample.java
│   ├── sample.ts
│   ├── sample.py
│   └── sample.go
└── scripts/
    ├── run-local.sh        # Convenience wrapper around `promptfoo eval`
    └── post-pr-comment.js  # Parses results.json and posts PR score summary
```

## Adding test cases

Each YAML file under `test-cases/` is a list of promptfoo test objects.
They are referenced from `promptfoo.yaml` via the `tests` key.  Add a new entry to
the appropriate file, or create a new file and reference it in `promptfoo.yaml`.

## References

- [promptfoo documentation](https://www.promptfoo.dev/docs/getting-started/)
- [promptfoo GitHub provider](https://www.promptfoo.dev/docs/providers/github/)

