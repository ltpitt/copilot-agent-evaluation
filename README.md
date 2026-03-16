# copilot-agent-evaluation

> **Making AI evals a habit** — a standard, repeatable way to measure Copilot and coding-agent quality before it reaches your engineers.

| | |
|---|---|
| **What this is** | A standard framework for evaluating GitHub Copilot and other coding agents against quality, safety, and consistency benchmarks. |
| **Why it matters** | Unreviewed AI output at scale introduces risk. This framework gives engineering teams a consistent signal to safely roll out Copilot with confidence. |
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

## What it does

| Category              | Tests | What it validates                                       |
|-----------------------|------:|--------------------------------------------------------|
| Code generation       |     4 | Correct syntax and structure across Python, TS, Go, Java |
| Refactoring           |     3 | Pattern application (list comprehensions, async/await, DRY) |
| Security              |     3 | Detection of SQL injection, XSS, plaintext passwords   |
| Instruction-following |     3 | Raw-code format compliance, JSON-only output, anti-sycophancy |

Two models are evaluated side-by-side: **GPT-4o** and **Claude 4 Sonnet**
(via the GitHub Models API).

## Why it matters

- **Regression detection** — catch quality drops when models are updated or prompts change.
- **Security confidence** — verify models flag OWASP-class vulnerabilities before code reaches review.
- **Audit trail** — every CI run produces a downloadable artifact with full pass/fail results.
- **Model comparison** — evaluate candidate models against the same test suite before rollout.

## Run in 60 seconds

```bash
# 1. Install promptfoo
npm install -g promptfoo

# 2. Set your GitHub Models API token (never commit this)
export GITHUB_TOKEN=<your-token>

# 3. Run the eval
make eval        # or: bash scripts/run-local.sh

# 4. View results in the browser
make view
```

> **Prerequisite:** Node.js v18+. Obtain a fine-grained PAT with `models:read`
> permission at https://github.com/settings/personal-access-tokens

## Scoreboard (expected output)

After running `make eval`, promptfoo produces a pass/fail matrix:

```
┌─────────────────────────────────┬────────────┬──────────────────┐
| Test                            │ gpt-4o     │ gpt-4o-mini      │
├─────────────────────────────────┼────────────┼──────────────────┤
│ Fibonacci (Python)              │ ✅ PASS    │ ✅ PASS          │
│ Array sum (TypeScript)          │ ✅ PASS    │ ✅ PASS          │
│ SQL injection detection         │ ✅ PASS    │ ✅ PASS          │
│ Anti-sycophancy (mutable args)  │ ✅ PASS    │ ✅ PASS          │
│ JSON-only output                │ ❌ FAIL    │ ✅ PASS          │
│ …                               │            │                  │
└─────────────────────────────────┴────────────┴──────────────────┘
```

> The table above is illustrative. Run `make eval && make view` to see live
> results. `promptfoo view` opens an interactive web UI with diffs, latencies,
> and per-assertion detail.

## Project layout

```
promptfoo.yaml              # Eval configuration: providers, prompts, test references
test-cases/
  coding-tasks.yaml         # Code generation tests (4)
  refactoring.yaml          # Refactoring tests (3)
  security.yaml             # Security vulnerability detection (3)
  instruction-following.yaml  # Format compliance + anti-sycophancy (3)
fixtures/                   # Sample source files (Python, TS, Java, Go)
scripts/run-local.sh        # Convenience wrapper for local runs
Makefile                    # make eval | make view | make clean
demo/                       # Demo materials: narrative, script, checklist
.github/workflows/          # CI pipeline (runs on PR + push to main)
```

## Adding test cases

Each YAML file under `test-cases/` is a list of promptfoo test objects.
They are referenced from `promptfoo.yaml` via the `tests` key. Add a new entry
to the appropriate file, or create a new file and reference it in
`promptfoo.yaml`.

## Safe usage

| Concern             | Control                                                                 |
|---------------------|-------------------------------------------------------------------------|
| **Secrets**         | `GITHUB_TOKEN` is never committed. Use `.env` locally (git-ignored) or GitHub Actions secrets in CI. |
| **Data boundaries** | Test prompts contain only synthetic code snippets — no customer data, PII, or internal IP. |
| **Network scope**   | Calls go only to `https://models.github.ai` (GitHub Models API). No other endpoints. |
| **Result storage**  | Eval results stay local (`.promptfoo/`) or as CI artifacts. Nothing is sent to third parties. |
| **Token permissions** | PAT requires only `models:read` — no repo write, no admin scope. |

## References

- [promptfoo documentation](https://www.promptfoo.dev/docs/getting-started/)
- [promptfoo GitHub Models provider](https://www.promptfoo.dev/docs/providers/github/)

