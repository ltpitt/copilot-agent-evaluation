# Hardening Checklist

Steps to make this evaluation suite enterprise-ready.

- [ ] **Pin promptfoo version.** Use `npm install -g promptfoo@<version>` in CI
  and scripts to guarantee reproducible results across runs.
- [ ] **Add fail-on-regression.** Pass a minimum pass threshold so CI blocks
  PRs that degrade scores.
- [ ] **Deepen assertions.** Current assertions are mostly `contains` keyword
  checks. Add `llm-rubric` or `javascript` assertions that validate logic
  correctness, not just keyword presence.
- [ ] **Lock model versions.** When the provider supports version pinning, pin
  to specific model snapshots so results do not shift silently on
  provider-side upgrades.
- [ ] **Add cost and latency tracking.** promptfoo reports latencies per call —
  surface these in a CI summary step or dashboard to catch performance
  regressions.
- [ ] **Separate the judge model.** If adding `llm-rubric` assertions,
  configure a dedicated grader model in `defaultTest.options.provider` so
  the model being tested does not grade itself.
- [ ] **Restrict network in CI.** Consider an allow-list proxy or firewall rule
  limiting CI egress to `models.github.ai` only — prevent accidental data
  exfiltration.
- [ ] **Wire up fixture files.** The sample source files in `fixtures/` are not
  yet referenced by any test case. Use them in refactoring or review tests,
  or remove them.
- [ ] **Extend to real-world use cases.** Interview the top 10 Copilot-heavy
  teams, capture their real prompts and failure modes, and encode those as
  regression tests.
- [ ] **Audit log retention.** Set artifact retention to match compliance policy
  and consider forwarding results to a central artifact store.
