FROM alpine:3.7@sha256:8421d9a84432575381bfabd248f1eb56f3aa21d9d7cd2511583c68c9b7511d10
RUN mkdir -p /var/app/dist
# `dist` needs to match up to the output dir from the frontend build tool.
COPY ./dist /var/app/
WORKDIR /var/app
