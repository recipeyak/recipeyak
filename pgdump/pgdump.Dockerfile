FROM debian:stretch-slim@sha256:0c04edb9ae10feb7ac03a659dd41e16c79e04fdb2b10cf93c3cbcef1fd6cc1d5

# For more info on install PG
# see: https://www.postgresql.org/download/linux/debian/
ENV PG_MAJOR 10

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
# hadolint ignore=DL3008
RUN apt-get update && \
      apt-get install -y --no-install-recommends \
      curl \
      ca-certificates \
      dirmngr \
      gnupg && \
      echo "deb http://apt.postgresql.org/pub/repos/apt/ stretch-pgdg main $PG_MAJOR" > /etc/apt/sources.list.d/pgdg.list && \
      curl -s https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - && \
      rm -rf /var/lib/apt/lists/*

# hadolint ignore=DL3008
RUN mkdir -p /usr/share/man/man1 && \
      mkdir -p /usr/share/man/man7 && \
      apt-get update && \
      apt-get install -y --no-install-recommends \
      postgresql-client-10 \
      python3-wheel \
      python3-setuptools \
      cron \
      python3-pip && \
      rm -rf /var/lib/apt/lists/*

RUN pip3 install -U awscli==1.16

COPY ./pgdump_cron /var/spool/cron/crontabs/root
COPY ./pgdump.sh /var/
COPY ./cron.sh /var/

CMD ["/var/cron.sh"]
