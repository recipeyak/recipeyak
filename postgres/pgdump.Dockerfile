FROM debian:stretch-slim

RUN mkdir -p /usr/share/man/man1 && \
      mkdir -p /usr/share/man/man7 && \
      apt-get update && \
      apt-get install -y \
      postgresql-client \
      cron \
      python3-pip && \
      rm -rf /var/lib/apt/lists/*

RUN pip3 install -U awscli==1.16

COPY ./pg_dump_cron /var/spool/cron/crontabs/root
COPY ./pg_dump.sh /var/
COPY ./cron.sh /var/

RUN /usr/bin/crontab /var/spool/cron/crontabs/root

CMD ["/var/cron.sh"]
