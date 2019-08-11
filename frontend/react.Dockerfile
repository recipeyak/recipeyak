FROM recipeyak/base:v3@sha256:8897faf71cb791feea88b1012db32d1b0d2970a2ffc722be9973f548af057bcd as builder

# Install Application into container
RUN set -ex && mkdir -p /var/app/frontend

WORKDIR /var/app

COPY package.json yarn.lock /var/app/

RUN yarn install

COPY ./frontend /var/app/frontend
COPY tsconfig.json /var/app/

ARG OAUTH_BITBUCKET_CLIENT_ID
ARG OAUTH_FACEBOOK_CLIENT_ID
ARG OAUTH_GITHUB_CLIENT_ID
ARG OAUTH_GITLAB_CLIENT_ID
ARG OAUTH_GOOGLE_CLIENT_ID
ARG FRONTEND_SENTRY_DSN
ARG GIT_SHA

RUN node /var/app/frontend/scripts/build.js && \
    bash /var/app/frontend/scripts/crawl.sh

FROM alpine:3.7@sha256:8421d9a84432575381bfabd248f1eb56f3aa21d9d7cd2511583c68c9b7511d10
RUN mkdir -p /var/app/build
COPY --from=builder /var/app/frontend/build /var/app/build
COPY --from=builder /var/app/frontend/entrypoint.sh /var/app/
WORKDIR /var/app

CMD ["/var/app/entrypoint.sh"]
