#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -x ".venv/bin/uvicorn" ]; then
  echo "Local Python environment is not ready. Run ./scripts/setup-local.sh first." >&2
  exit 1
fi

./scripts/cleanup-local.sh

cleanup() {
  if [ -n "${GATEWAY_PID:-}" ] && kill -0 "$GATEWAY_PID" >/dev/null 2>&1; then
    kill "$GATEWAY_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

(
  cd services/quote-gateway
  ../../.venv/bin/uvicorn app.main:app --reload --host 127.0.0.1 --port 8787
) &
GATEWAY_PID=$!

echo "Quote gateway started on http://127.0.0.1:8787"
echo "Tauri desktop app starting with Vite on http://127.0.0.1:5173"

npm run tauri:dev
