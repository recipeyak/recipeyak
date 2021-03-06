#!/usr/bin/env bash
set -eu

cd "$(dirname "$(dirname "$0")")"

PORT=8808

pushd build || exit

python3 -m http.server "$PORT" &

popd

HTTP_SERVER=$!

# wait for port
MAX_INC=20
INC=0
INTERVAL=0.1
while ! nc -z localhost "$PORT"; do
  sleep "$INTERVAL"
  INC=$((INC + 1))
  if [[ "$INC" -ge "$MAX_INC" ]]; then
    exit 1
  fi
done

TMP_FILE=$(mktemp)

./scripts/crawl.js http://localhost:"$PORT" "$TMP_FILE"

# kill the background webserver
kill "$HTTP_SERVER"

mv -f "$TMP_FILE" build/landing.html
chmod +r build/landing.html
