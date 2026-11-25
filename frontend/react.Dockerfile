FROM alpine:3.24@sha256:be2656061b536c1883c4034790e21d0a09c5aaaf51968b89368a3c0371ea2c9a
RUN mkdir -p /var/app/dist
# `dist` needs to match up to the output dir from the frontend build tool.
COPY ./dist /var/app/
WORKDIR /var/app
