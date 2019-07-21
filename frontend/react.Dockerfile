FROM recipeyak/base:v3 as builder

# Install Application into container
RUN set -ex && mkdir -p /var/app

WORKDIR /var/app
COPY . /var/app

# Install our dev dependencies
RUN poetry install
RUN yarn install

ARG OAUTH_BITBUCKET_CLIENT_ID
ARG OAUTH_FACEBOOK_CLIENT_ID
ARG OAUTH_GITHUB_CLIENT_ID
ARG OAUTH_GITLAB_CLIENT_ID
ARG OAUTH_GOOGLE_CLIENT_ID
ARG FRONTEND_SENTRY_DSN
ARG GIT_SHA

RUN poetry run yak build --web

FROM alpine:3.7
RUN mkdir -p /var/app/build
COPY --from=builder /var/app/frontend/build /var/app/build
COPY --from=builder /var/app/frontend/bootstrap.sh /var/app/
WORKDIR /var/app

COPY ./bootstrap.sh /var/

CMD ["/var/bootstrap.sh"]
