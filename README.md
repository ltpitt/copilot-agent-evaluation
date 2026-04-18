# copilot-agent-evaluation

Run automated evaluations against GitHub Copilot and other LLMs using [promptfoo](https://www.promptfoo.dev/). Tests are plain YAML. Results come back in ~60 seconds. The GitHub Actions workflow posts a pass/fail summary on every PR.

Think of it as a test suite for your AI models: catches regressions before they affect engineers, and gives you real data when comparing models.

## What this platform does

This repo implements **two quality gates** for AI-assisted development:

| Gate | What it catches | How |
|------|----------------|-----|
| **Garbage In** (prompt quality) | Bad prompts: vague, missing context, wrong agent/skill | Free LLM (`gpt-4o-mini`) judges prompts against best practices |
| **Garbage Out** (output quality) | Bad model responses: wrong code, security issues, format drift | Deterministic assertions (`contains`, `javascript`) on model output |

```
Developer writes prompt → Prompt Quality Gate → Output Quality Gate → ✅ or ❌
                          (is the prompt good?)   (is the output good?)
```

## Quick demo

```bash
# 1. Set your GitHub Models token
export GITHUB_TOKEN=your_token_here

# 2. Run all evaluations (prompt quality + output quality)
make eval

# 3. View results in browser
make view
```

The results show two categories side by side:
- **Prompt quality tests** — did the prompt follow best practices?
- **Output quality tests** — did the model generate correct code?

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

### Prompt quality (garbage in)

| Test | Verdict | Why |
|------|---------|-----|
| `@pipisoft-codebot /code-review` + SQL injection code | ✅ PASS | Clear task, correct agent/skill, code provided, specific concern |
| `@pipisoft-codebot /test-generation` + auth function | ✅ PASS | Framework specified, edge cases listed, code attached |
| `"fix the code"` | ❌ FAIL | No context, no code, no agent, completely vague |
| `"write some tests"` | ❌ FAIL | No code to test, no framework, no edge cases |
| `@pipisoft-codebot /code-review Check this for bugs.` | ❌ FAIL | Has agent but no code — routing alone isn't enough |

The judge model (`gpt-4o-mini`) evaluates prompts against:
- **Universal best practices** from Claude and Copilot documentation
- **Company rules** from `fixtures/pipisoft-rules.yaml` (agents, skills, required context)

### Output quality (garbage out)

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

## Adding company rules

Edit `fixtures/pipisoft-rules.yaml` to define your agents, skills, and prompt requirements:

```yaml
company: YourCompany

agents:
  - name: "@your-agent"
    description: "What this agent does"
    skills:
      - id: your-skill
        description: "What this skill does"
        required_context:
          - "what context the prompt must include"
```

Then update the `llm-rubric` values in `test-cases/prompt-quality.yaml` to reference your rules.

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
├── promptfoo.yaml                   # Models, judge model, and test file references
├── test-cases/
│   ├── prompt-quality.yaml          # NEW: Prompt quality gate (llm-rubric)
│   ├── coding-tasks.yaml            # Code generation tests
│   ├── refactoring.yaml             # Refactoring tests
│   ├── security.yaml                # Security awareness tests
│   ├── instruction-following.yaml   # Format compliance tests
│   └── model-drift.yaml             # Regression detection tests
├── fixtures/
│   ├── pipisoft-rules.yaml          # Company agent/skill definitions
│   └── sample.*                     # Sample source files for test cases
├── roadmap/
│   ├── 01-cicd-prompt-quality-gate.md   # Spec: CI/CD approach (this POC)
│   └── 02-runtime-prompt-middleware.md  # Spec: Runtime SDK (future)
└── scripts/
    ├── run-local.sh                 # Thin wrapper around `promptfoo eval`
    └── post-pr-comment.js           # Parses results.json, posts PR summary comment
```

## References

- [promptfoo docs](https://www.promptfoo.dev/docs/getting-started/)
- [promptfoo GitHub Models provider](https://www.promptfoo.dev/docs/providers/github/)
- [GitHub Models](https://github.com/marketplace/models)
- [Claude prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-prompting-best-practices)
- [promptfoo LLM-graded assertions](https://www.promptfoo.dev/docs/configuration/expected-outputs/model-graded/)

