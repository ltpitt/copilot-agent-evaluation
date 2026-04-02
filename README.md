# copilot-agent-evaluation

Run automated evaluations against GitHub Copilot and other LLMs using [promptfoo](https://www.promptfoo.dev/). Tests are plain YAML. Results come back in ~60 seconds. The GitHub Actions workflow posts a pass/fail summary on every PR.

Think of it as a test suite for your AI models: catches regressions before they affect engineers, and gives you real data when comparing models.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A GitHub personal access token with `models:read` scope

## Run locally

```bash
# Export your token
export GITHUB_TOKEN=your_token_here

# Run all evaluations
make eval

# Open the results in your browser
make view
```

`make help` lists all available targets.

## Run via GitHub Actions

The workflow in `.github/workflows/eval.yaml` triggers on every PR to `main`. It runs the full test suite, posts a score summary comment on the PR, and fails the check if any assertion fails — blocking the merge.

**One-time setup:** add a repository secret named `GH_MODELS_TOKEN` — a GitHub PAT with the `models:read` scope. Go to **Settings → Secrets and variables → Actions → New repository secret**.

The built-in `GITHUB_TOKEN` (auto-available in every workflow) is used automatically to post PR comments; no extra setup needed for that.

That's it. Push a PR and the workflow runs.

## What gets tested

| File | What it covers |
|------|---------------|
| `test-cases/coding-tasks.yaml` | Code generation in Python, TypeScript, Go, Java |
| `test-cases/refactoring.yaml` | Code improvement and cleanup prompts |
| `test-cases/security.yaml` | Security-aware responses |
| `test-cases/instruction-following.yaml` | Output format and instruction compliance |
| `test-cases/model-drift.yaml` | Regression gates — catch silent changes after a model update |

### What model-drift tests catch

LLM providers update models silently. A response that passed yesterday can fail today with no code change on your side. The drift gates in `model-drift.yaml` cover exactly this:

| Gate | What breaks if it regresses |
|------|-----------------------------|
| Bare-code output | `exec()` receives markdown fences and crashes |
| SQL-injection keyword | String-based security scanners stop flagging issues |
| Deprecation signal | PR bots stop surfacing deprecation warnings |
| Anti-hallucination | Non-existent APIs get copied into production code |
| Exact bullet count | Layout engines throw index errors on unexpected output length |

All assertions are deterministic (`contains`, `not-contains`, `javascript`) — no LLM judge, fully reproducible.

## Adding your own test cases

Add entries to any YAML file under `test-cases/`, or create a new file and reference it in `promptfoo.yaml` under the `tests` key. No code changes required.

Each entry looks like this:

```yaml
- vars:
    prompt: "Your prompt here"
  assert:
    - type: contains
      value: "expected string"
```

See the [promptfoo assertion docs](https://www.promptfoo.dev/docs/configuration/expected-outputs/) for the full list of assertion types.

## Project layout

```
.
├── .github/workflows/eval.yaml      # PR check: run evals, post comment, block on failure
├── promptfoo.yaml                   # Models and test file references
├── test-cases/                      # All test cases, one category per file
├── fixtures/                        # Sample source files referenced by test cases
└── scripts/
    ├── run-local.sh                 # Thin wrapper around `promptfoo eval`
    └── post-pr-comment.js           # Parses results.json, posts PR summary comment
```

## References

- [promptfoo docs](https://www.promptfoo.dev/docs/getting-started/)
- [promptfoo GitHub Models provider](https://www.promptfoo.dev/docs/providers/github/)
- [GitHub Models](https://github.com/marketplace/models)

