#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

for port in 5174 8787; do
  if command -v lsof >/dev/null 2>&1; then
    pids="$(lsof -ti tcp:"$port" || true)"
    if [ -n "$pids" ]; then
      echo "$pids" | xargs kill >/dev/null 2>&1 || true
      echo "Stopped processes on port $port"
    fi
  fi
done

rm -rf .cache/tmp
find services/quote-gateway -type d -name "__pycache__" -prune -exec rm -rf {} +

echo "FishStock local environment cleanup finished."
