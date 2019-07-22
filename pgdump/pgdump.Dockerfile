FROM debian:stretch-slim

ENV PG_MAJOR 10

# For more info on install PG
# see: https://www.postgresql.org/download/linux/debian/
RUN apt-get update && \
      apt-get install -y \
      curl \
      gnupg && \
      echo "deb http://apt.postgresql.org/pub/repos/apt/ stretch-pgdg main $PG_MAJOR" > /etc/apt/sources.list.d/pgdg.list && \
      curl -s https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - && \
      apt-get update

RUN mkdir -p /usr/share/man/man1 && \
      mkdir -p /usr/share/man/man7 && \
      apt-get update && \
      apt-get install -y \
      postgresql-client-10 \
      cron \
      python3-pip && \
      rm -rf /var/lib/apt/lists/*

RUN pip3 install -U awscli==1.16

COPY ./pgdump_cron /var/spool/cron/crontabs/root
COPY ./pgdump.sh /var/
COPY ./cron.sh /var/

CMD ["/var/cron.sh"]
