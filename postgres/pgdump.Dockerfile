FROM debian:stretch-slim

RUN apt-get update && \
    apt-get install -y postgresql-client

RUN python3 -m pip install -U awscli==1.16

COPY ./pg_dump.sh /var/

CMD ["cron", "-f"]
