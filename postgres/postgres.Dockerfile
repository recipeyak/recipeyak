FROM postgres:10.1

COPY ./postgres.conf "$PGDATA"

# see: https://www.postgresql.org/docs/9.3/app-pg-isready.html
HEALTHCHECK CMD pg_isready -U postgres
