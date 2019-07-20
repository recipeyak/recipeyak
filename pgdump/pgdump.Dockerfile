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

COPY ./pgdump_cron /var/spool/cron/crontabs/root
COPY ./pgdump.sh /var/
COPY ./cron.sh /var/

CMD ["/var/cron.sh"]
