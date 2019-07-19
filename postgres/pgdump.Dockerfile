FROM debian:stretch


# grab gosu for easy step-down from root
ENV GOSU_VERSION 1.11
RUN set -x \
      && apt-get update && apt-get install -y --no-install-recommends ca-certificates wget && rm -rf /var/lib/apt/lists/* \
      && wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$(dpkg --print-architecture)" \
      && chmod +x /usr/local/bin/gosu \
      && gosu nobody true \
      && apt-get purge -y --auto-remove ca-certificates wget

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

RUN /usr/bin/crontab /var/spool/cron/crontabs/root

CMD ["cron", "-f"]
