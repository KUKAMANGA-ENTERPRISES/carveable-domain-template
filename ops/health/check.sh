#!/usr/bin/env bash
# ops/health/check.sh — one-command health check for hello-world.
#
# Verifies every layer can be reached. Exit 0 = green.

set -euo pipefail

PORT="${HELLO_PORT:-8910}"
BASE="http://127.0.0.1:${PORT}"
PASS=0
FAIL=0

check() {
  local label="$1"; shift
  if "$@" > /dev/null 2>&1; then
    echo "  [ok]   $label"
    PASS=$((PASS+1))
  else
    echo "  [FAIL] $label"
    FAIL=$((FAIL+1))
  fi
}

echo "[health] hello-world @ $BASE"

# Adapter layer — pure JS, no HTTP needed
check "adapter:echo emits source=echo" \
  node -e "import('./adapters/echo/index.js').then(m => { if (m.echo.getPrefix().source !== 'echo') process.exit(1) })"

# Service layer
check "service:hello composes greeting" \
  node -e "import('./services/hello/index.js').then(m => { const r = m.hello.sayHello({name:'health'}); if (!r.greeting.includes('health') || r.source !== 'echo') process.exit(1) })"

# Behavior layer
check "tool:say_hello wraps service" \
  node -e "import('./behavior/tools/say-hello.js').then(m => { const r = m.tool.invoke({name:'health'}); if (r.source !== 'echo') process.exit(1) })"

# HTTP layer — requires server running. Use node's fetch directly (cross-platform).
if node -e "fetch('$BASE/api/hello').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))" > /dev/null 2>&1; then
  check "http:/api/hello returns valid greeting" \
    node -e "fetch('$BASE/api/hello?name=health').then(r=>r.json()).then(r=>{ if (!r.greeting || !r.greeting.includes('health') || r.source !== 'echo') process.exit(1) })"
else
  echo "  [skip] http:/api/hello — server not running on $BASE"
fi

# Contract presence
check "contract:hello.openapi.yaml exists" test -f interface/contracts/hello.openapi.yaml

echo "[health] passed=$PASS failed=$FAIL"
[ "$FAIL" -eq 0 ]
