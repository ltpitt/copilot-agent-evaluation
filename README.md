# copilot-agent-evaluation

Automated quality gates for GitHub Copilot and coding agents.

Runs deterministic and behavioural evaluations against multiple LLMs using
[promptfoo](https://www.promptfoo.dev/) — designed for regulated environments
that require auditability, reproducibility, and regression detection.

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
| Test                            │ gpt-5-nano │ gpt-5-mini       │
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

