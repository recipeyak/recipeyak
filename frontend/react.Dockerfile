FROM node:18.7.0 as builder

# Install Application into container
RUN set -ex && mkdir -p /var/app/

WORKDIR /var/app

COPY package.json yarn.lock /var/app/

RUN yarn install

COPY . /var/app/

ARG FRONTEND_SENTRY_DSN
ARG GIT_SHA

RUN s/build

FROM alpine:3.7@sha256:8421d9a84432575381bfabd248f1eb56f3aa21d9d7cd2511583c68c9b7511d10
RUN mkdir -p /var/app/build
COPY --from=builder /var/app/build /var/app/build
COPY --from=builder /var/app/entrypoint.sh /var/app/
WORKDIR /var/app

CMD ["/var/app/entrypoint.sh"]
