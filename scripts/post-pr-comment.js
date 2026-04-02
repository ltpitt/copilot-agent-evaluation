#!/usr/bin/env node
"use strict";

/**
 * scripts/post-pr-comment.js
 *
 * Reads the promptfoo results.json produced by `npx promptfoo eval --output`
 * and posts a concise score-summary comment on the pull request.
 *
 * Environment variables (all set by the GitHub Actions workflow):
 *   GH_TOKEN   — auto-generated GITHUB_TOKEN (pull-requests: write permission)
 *   PR_NUMBER  — pull request number
 *   REPO       — "owner/repo" string
 *
 * The script is intentionally dependency-free (Node built-ins only) so it
 * works without a separate `npm install` step in CI.
 */

const fs = require("fs");
const https = require("https");

const RESULTS_FILE = "results.json";

// ── Parse results ─────────────────────────────────────────────────────────────

function parseResults(data) {
  // promptfoo writes the array under data.results in some versions and as the
  // top-level array in others; handle both gracefully.
  const results = Array.isArray(data) ? data : data.results ?? [];
  const total = results.length;
  const passed = results.filter((r) => r.success === true).length;
  const failed = total - passed;
  const score = total > 0 ? Math.round((passed / total) * 100) : 0;
  return { results, total, passed, failed, score };
}

// ── Build the markdown comment ────────────────────────────────────────────────

function buildComment({ results, total, passed, failed, score }) {
  const allPassed = failed === 0;
  const headerEmoji = allPassed ? "✅" : "❌";
  const statusLine = allPassed
    ? "✅ All tests passed — no model drift detected."
    : `❌ **${failed} test(s) failed** — possible model drift detected.`;

  let md = `## ${headerEmoji} Copilot Agent Evaluation\n\n`;
  md += `${statusLine}\n\n`;
  md += `| | |\n|---|---|\n`;
  md += `| **Score** | ${score}% (${passed}/${total} passed) |\n`;

  if (failed > 0) {
    md += `\n### ❌ Failed tests\n\n`;
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        const provider = String(r.provider?.id ?? r.provider ?? "unknown").replace(
          "github:",
          ""
        );
        const description = String(
          r.testCase?.description ?? r.description ?? "—"
        )
          .split("\n")[0]
          .trim();
        const reason = String(r.gradingResult?.reason ?? "").split("\n")[0].trim();
        md += `- **${provider}** — ${description}\n`;
        if (reason) md += `  > ${reason}\n`;
      });
    md += "\n";
  }

  // Collapsible full table
  md += `<details><summary>All results</summary>\n\n`;
  md += `| Status | Provider | Test |\n|--------|----------|------|\n`;
  results.forEach((r) => {
    const status = r.success ? "✅" : "❌";
    const provider = String(r.provider?.id ?? r.provider ?? "").replace("github:", "");
    const description = String(r.testCase?.description ?? r.description ?? "—")
      .split("\n")[0]
      .trim()
      .slice(0, 80);
    md += `| ${status} | ${provider} | ${description} |\n`;
  });
  md += `\n</details>\n`;

  return md;
}

// ── GitHub API helper ─────────────────────────────────────────────────────────

function postComment(token, repo, prNumber, body) {
  const [owner, repoName] = repo.split("/");
  const payload = JSON.stringify({ body });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.github.com",
      path: `/repos/${owner}/${repoName}/issues/${prNumber}/comments`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        "User-Agent": "copilot-agent-evaluation",
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    };

    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log("✅ PR comment posted successfully.");
          resolve();
        } else {
          reject(new Error(`GitHub API returned HTTP ${res.statusCode}: ${raw}`));
        }
      });
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(RESULTS_FILE)) {
    console.error(`❌ ${RESULTS_FILE} not found — did the eval step run?`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf8"));
  const parsed = parseResults(data);
  const comment = buildComment(parsed);

  console.log("─── Comment preview ───────────────────────────────────────────");
  console.log(comment);
  console.log("───────────────────────────────────────────────────────────────");

  const { GH_TOKEN, PR_NUMBER, REPO } = process.env;

  if (!GH_TOKEN || !PR_NUMBER || !REPO) {
    console.log("ℹ️  Not in a PR context (missing GH_TOKEN / PR_NUMBER / REPO). Skipping comment.");
    return;
  }

  await postComment(GH_TOKEN, REPO, PR_NUMBER, comment);
}

main().catch((err) => {
  console.error("Error posting PR comment:", err.message);
  process.exit(1);
});
