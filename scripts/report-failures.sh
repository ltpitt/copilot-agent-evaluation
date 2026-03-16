#!/usr/bin/env bash
# Report test failures from results.json clearly for demo purposes

set -euo pipefail

if [ ! -f results.json ]; then
  echo "❌ results.json not found. Run 'make eval' first."
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 EVALUATION RESULTS SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get stats
STATS=$(jq '.results.stats' results.json 2>/dev/null)
PASSED=$(echo "$STATS" | jq '.testsPassed // 0')
FAILED=$(echo "$STATS" | jq '.testsFailed // 0')
TOTAL=$((PASSED + FAILED))

if [ "$TOTAL" -gt 0 ]; then
  PERCENT=$((PASSED * 100 / TOTAL))
  echo "✅ PASSED: $PASSED / $TOTAL ($PERCENT%)"
  echo ""
fi

# Get failed tests
FAILURES=$(jq '.results.results[] | select(.gradingResult.pass == false) | {
  provider: .provider.id,
  test: .prompt.raw[0:70],
  reason: .gradingResult.reason
}' results.json 2>/dev/null || echo "")

FAILURE_COUNT=$(echo "$FAILURES" | jq -s 'length' 2>/dev/null || echo "0")

if [ "$FAILURE_COUNT" -gt 0 ]; then
  echo "❌ FAILURES ($FAILURE_COUNT tests):"
  echo ""
  echo "$FAILURES" | jq -r '"  • [\(.provider)]\n    Test: \(.test | gsub("\n"; " "))\n    Reason: \(.reason)"' | sed 's/\\n/\n/g'
  echo ""
  echo "💡 WHY THESE FAILURES ARE EXPECTED:"
  echo "  • JSON-only format test: Catches when models wrap JSON in markdown fences"
  echo "    (This validates our eval framework detects real quality issues)"
  echo ""
  echo "🔍 To investigate: run 'make view' to see detailed diff and output"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
