FROM alpine:3.24@sha256:294b683cb724975bec92580e1e685676bd4b50bda910ddb8c51d4cabeaec77e6
RUN mkdir -p /var/app/dist
# `dist` needs to match up to the output dir from the frontend build tool.
COPY ./dist /var/app/
WORKDIR /var/app
