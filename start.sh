#!/usr/bin/env bash
set -e
# Entrypoint for Railway when start.sh is configured at repo root
# It delegates to the backend service and starts gunicorn bound to $PORT.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/servicebook-pros-backend"

PORT="${PORT:-8080}"
GUNICORN_WORKERS="${GUNICORN_WORKERS:-2}"

exec gunicorn -w "$GUNICORN_WORKERS" -k gthread -b 0.0.0.0:"$PORT" src.main:app
