# Demo Script

## Spoken intro (~90 seconds)

> We are scaling Copilot and coding agents across the organisation — the
> productivity gains are real, but so is the risk. When a model update ships,
> how do we know it still flags SQL injection? How do we know it does not start
> wrapping JSON output in markdown that breaks our pipelines? Today there is no
> automated answer to that.
>
> What you are about to see is the seed of an automated quality gate for coding
> agents. It is a test suite — 13 tests across four categories: code
> generation, refactoring, security detection, and instruction-following. It
 It runs two models side-by-side — GPT-5 Nano and GPT-5 Mini — and produces a
> pass/fail scoreboard in under five minutes.
>
> Right now it runs locally from the IDE. By end of next sprint it runs in CI
> on every pull request — meaning no model change, no prompt change, and no
> config change ships without proving it still passes our bar. Think of it as
> unit tests, but for the AI itself.
>
> What we need next: one sprint of dedicated time to harden this into a
> production gate and extend the test suite to our top ten real-world Copilot
> use cases.

## Live demo flow (~2 minutes)

| Time  | Action | What is on screen |
|-------|--------|-------------------|
| 0:00  | Open terminal, run `make eval` | Terminal shows promptfoo running tests, progress bar, model calls |
| 0:30  | While eval runs, switch to editor — open `test-cases/security.yaml` | Show the SQL injection test prompt + assertion. Say: "This is what a test looks like — a prompt and a pass condition." |
| 0:50  | Switch to `promptfoo.yaml` | Show the two providers side-by-side. Say: "We test multiple models with the same suite — compare before we commit." |
| 1:10  | Switch back to terminal — eval should be finishing | Show the pass/fail summary table in the terminal |
| 1:30  | Run `make view` | Browser opens with promptfoo web UI — click into a failed test (if any), show the diff between expected and actual |
| 1:50  | Scroll to the JSON-only test result | Say: "This one checks if the model returns valid JSON without wrapping it in markdown. That matters because our pipelines call JSON.parse on raw output." |
| 2:00  | Done | Return to conversation |

## Anticipated questions

### "How do we know these tests are enough?"

They are not — and that is by design. This is a seed suite proving the
*mechanism* works. The next step is to interview the top Copilot-heavy teams,
capture their real prompts and failure modes, and encode those as regression
tests. The framework scales linearly — adding a test is adding 10 lines of
YAML.

### "What happens when a test fails in CI?"

The PR is blocked. The developer sees exactly which model, which test, and
which assertion failed — with the full prompt and response. They can fix the
prompt, adjust the assertion, or escalate if it is a model regression outside
our control. Every failure is recorded as a downloadable artifact tied to the
commit SHA.

### "Does any proprietary code or data touch these models?"

No. Every test prompt uses synthetic code snippets written specifically for
evaluation. No customer data, no internal source code, no PII. The API calls
go only to GitHub's models endpoint. Network restrictions can be added in CI to
enforce this boundary.
