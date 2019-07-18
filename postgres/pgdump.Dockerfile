FROM debian:stretch

RUN mkdir -p /usr/share/man/man1 && \
    mkdir -p /usr/share/man/man7 && \
    apt-get update && \
    apt-get install -y \
      postgresql-client \
      cron \
      python3-pip

RUN pip3 install -U awscli==1.16

COPY ./pg_dump_cron /var/spool/cron/crontabs/root
COPY ./pg_dump.sh /var/

CMD ["cron", "-f"]
