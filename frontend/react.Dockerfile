FROM node:14@sha256:a33ccec42e036118e7c797a7251387f8c4fb3486905d587b0453725a84e4d3e3 as builder

# Install Application into container
RUN set -ex && mkdir -p /var/app/

WORKDIR /var/app

COPY package.json yarn.lock /var/app/

RUN yarn install

COPY . /var/app/

ARG FRONTEND_SENTRY_DSN
ARG GIT_SHA

RUN yarn build

FROM alpine:3.7@sha256:8421d9a84432575381bfabd248f1eb56f3aa21d9d7cd2511583c68c9b7511d10
RUN mkdir -p /var/app/build
COPY --from=builder /var/app/build /var/app/build
COPY --from=builder /var/app/entrypoint.sh /var/app/
WORKDIR /var/app

CMD ["/var/app/entrypoint.sh"]
