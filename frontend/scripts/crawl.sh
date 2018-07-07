#!/usr/bin/env bash
set -eux

if ! hash serve 2>/dev/null; then
  yarn global add serve
fi

if [[ "$OSTYPE" == "linux-gnu" ]]; then
  sudo apt-get install -yq \
    gconf-service \
    libasound2 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    libappindicator1 \
    libnss3 \
    lsb-release \
    xdg-utils \
    wget
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
