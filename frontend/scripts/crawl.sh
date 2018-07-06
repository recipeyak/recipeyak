#!/usr/bin/env bash
set -eux

yarn global add serve

serve build -l 8008 &

# wait for port
INC=0
while ! nc -z localhost 8008; do
  sleep 0.1
  INC=$(($INC + 1))
  if [[ $INC -ge 20 ]]; then
    exit 1
  fi
done

./scripts/crawl.js http://localhost:8008 /tmp/content.html

# kill the background python webserver
kill %%

mv -f /tmp/content.html build/index.html
