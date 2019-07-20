FROM postgres:10.1

# see: https://www.postgresql.org/docs/9.3/app-pg-isready.html
HEALTHCHECK CMD pg_isready -U postgres
