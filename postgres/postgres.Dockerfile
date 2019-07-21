FROM postgres:10.1

COPY ./postgresql.conf /etc/postgresql/

# see: https://www.postgresql.org/docs/9.3/app-pg-isready.html
HEALTHCHECK CMD pg_isready -U postgres

# Since the image mounts "$PGDATA" as a volume, we cannot copy the config file
# to "$PGDATA".
# see: https://stackoverflow.com/q/30848670/3720597
CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]
