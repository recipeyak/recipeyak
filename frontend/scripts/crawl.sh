#!/usr/bin/env bash
set -eux

PORT=8008

serve build -l "$PORT" &

# wait for port
MAX_INC=20
INC=0
INTERVAL=0.1
while ! nc -z localhost "$PORT"; do
  sleep "$INTERVAL"
  INC=$(($INC + 1))
  if [[ "$INC" -ge "$MAX_INC" ]]; then
    exit 1
  fi
done

TMP_FILE=$(mktemp)

./scripts/crawl.js http://localhost:"$PORT" "$TMP_FILE"

# kill the background webserver
kill %%

mv -f "$TMP_FILE" build/index.html
