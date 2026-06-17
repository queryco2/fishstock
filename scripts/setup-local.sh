#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required but was not found." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required but was not found." >&2
  exit 1
fi

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install -r services/quote-gateway/requirements.txt

npm install

cat <<'EOF'
FishStock local environment is ready.

Run:
  npm run env:dev

Services:
  Quote gateway: http://127.0.0.1:8787
  Desktop web preview: http://127.0.0.1:5174
EOF
