FROM debian:stretch-slim

RUN apt-get update && \
    apt-get install -y postgresql-client

COPY ./pg_dump.sh /

CMD ["cron", "-f"]
