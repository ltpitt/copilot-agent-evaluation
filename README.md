# copilot-agent-evaluation

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
```

The results will open automatically in your browser. You can also run `promptfoo view` at any time to reopen the viewer.

## Project layout

```
.
├── promptfoo.yaml          # Main promptfoo configuration
├── test-cases/
│   ├── coding-tasks.yaml   # Code generation / completion prompts
│   ├── refactoring.yaml    # Code refactoring prompts
│   └── security.yaml       # Security-focused prompts
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

