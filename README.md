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

## Project layout

```
.
├── promptfoo.yaml          # Main promptfoo configuration
├── test-cases/
│   ├── coding-tasks.yaml        # Code generation / completion prompts
│   ├── refactoring.yaml         # Code refactoring prompts
│   ├── security.yaml            # Security-focused prompts
│   └── instruction-following.yaml  # Instruction-following / format prompts
├── fixtures/               # Tiny sample source files used by test cases
│   ├── Sample.java
│   ├── sample.ts
│   ├── sample.py
│   └── sample.go
└── scripts/
    └── run-local.sh        # Convenience wrapper around `promptfoo eval`
```

## Adding test cases

Each YAML file under `test-cases/` is a list of promptfoo test objects.
They are referenced from `promptfoo.yaml` via the `tests` key.  Add a new entry to
the appropriate file, or create a new file and reference it in `promptfoo.yaml`.

## References

- [promptfoo documentation](https://www.promptfoo.dev/docs/getting-started/)
- [promptfoo GitHub provider](https://www.promptfoo.dev/docs/providers/github/)

