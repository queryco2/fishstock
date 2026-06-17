#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

stop_port() {
  local port="$1"
  local pids=""

  if ! command -v lsof >/dev/null 2>&1; then
    return
  fi

  pids="$(lsof -ti tcp:"$port" || true)"
  if [ -z "$pids" ]; then
    return
  fi

  echo "$pids" | xargs kill >/dev/null 2>&1 || true

  for _ in $(seq 1 20); do
    pids="$(lsof -ti tcp:"$port" || true)"
    if [ -z "$pids" ]; then
      echo "Stopped processes on port $port"
      return
    fi
    sleep 0.1
  done

  echo "$pids" | xargs kill -9 >/dev/null 2>&1 || true
  echo "Stopped processes on port $port"
}

for port in 5173 5174 8787; do
  stop_port "$port"
done

for pattern in "target/debug/fishstock" "node_modules/.bin/tauri dev"; do
  if command -v pgrep >/dev/null 2>&1; then
    pids="$(pgrep -f "$pattern" || true)"
    if [ -n "$pids" ]; then
      echo "$pids" | xargs kill >/dev/null 2>&1 || true
      echo "Stopped $pattern"
    fi
  fi
done

rm -rf .cache/tmp
find services/quote-gateway -type d -name "__pycache__" -prune -exec rm -rf {} +

echo "FishStock local environment cleanup finished."
