FROM debian:stretch-slim

RUN mkdir -p /usr/share/man/man1 && \
    mkdir -p /usr/share/man/man7 && \
    apt-get update && \
    apt-get install -y postgresql-client

RUN apt-get update && \
    apt-get install -y python3-pip && \
    pip3 install -U awscli==1.16

COPY ./pg_dump_cron /etc/crontabs/root
COPY ./pg_dump.sh /var/

CMD ["cron", "-f"]
