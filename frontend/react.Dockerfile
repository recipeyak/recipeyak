FROM node:14@sha256:a33ccec42e036118e7c797a7251387f8c4fb3486905d587b0453725a84e4d3e3 as builder

# we use netcat to wait for a port to be available
# hadolint ignore=DL3008
RUN apt-get update -yq && \
    apt-get install -yq --no-install-recommends \
    netcat && \
    rm -rf /var/lib/apt/lists/*

# install chrome dependencies for puppeteer
# hadolint ignore=DL3008
RUN apt-get update -yq && \
    apt-get install -yq --no-install-recommends \
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
    wget && \
    rm -rf /var/lib/apt/lists/*

# Install Application into container
RUN set -ex && mkdir -p /var/app/

WORKDIR /var/app

COPY package.json yarn.lock /var/app/

RUN yarn install

COPY . /var/app/

ARG FRONTEND_SENTRY_DSN
ARG GIT_SHA

RUN node /var/app/scripts/build.js && \
    bash /var/app/scripts/crawl.sh

FROM alpine:3.7@sha256:8421d9a84432575381bfabd248f1eb56f3aa21d9d7cd2511583c68c9b7511d10
RUN mkdir -p /var/app/build
COPY --from=builder /var/app/build /var/app/build
COPY --from=builder /var/app/entrypoint.sh /var/app/
WORKDIR /var/app

CMD ["/var/app/entrypoint.sh"]
