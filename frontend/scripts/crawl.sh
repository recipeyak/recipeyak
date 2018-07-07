#!/usr/bin/env bash
set -eux

if ! hash serve 2>/dev/null; then
  yarn global add serve
fi

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

./scripts/crawl.js http://localhost:"$PORT" /tmp/content.html

# kill the background webserver
kill %%

mv -f /tmp/content.html build/index.html
