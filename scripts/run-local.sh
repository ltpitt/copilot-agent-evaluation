#!/usr/bin/env bash
# Run the promptfoo evaluation locally.
# Prerequisites:
#   - Node.js v18+
#   - GITHUB_TOKEN exported in your shell
#   - promptfoo installed: npm install -g promptfoo

set -euo pipefail

# Ensure GITHUB_TOKEN is set
if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "Error: GITHUB_TOKEN is not set." >&2
  echo "Export a GitHub personal access token with 'models:read' permission:" >&2
  echo "  export GITHUB_TOKEN=your_token_here" >&2
  exit 1
fi

# Move to the repo root regardless of where the script is invoked from
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}/.."

echo "Running promptfoo eval..."
npx promptfoo eval --config promptfoo.yaml "$@"
