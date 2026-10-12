# backend-rs

A Rust reimplemention of the API.


```sh
./s/dev  # loads env vars from ../backend/.env
curl -b sessionid=... 'localhost:8001/api/v1/calendar/?start=2026-09-06&end=2026-10-24'
```

Env vars: `DATABASE_URL`, `STORAGE_HOSTNAME`, `PORT` (default 8001), and
`DJANGO_SECRET_KEY` unless `DEBUG=1`, in which case the Django dev key is used.
## Tests

Integration tests in `tests/` run the app against a fresh Postgres database
per test, created from `DATABASE_URL` and loaded with `tests/schema/`:

```sh
DATABASE_URL=postgres://postgres@localhost:5432/postgres cargo test
```

`tests/schema/0001_schema.sql` is generated from the Django migrations. After
adding a migration, regenerate it with a `pg_dump` matching the server version:

```sh
PG_DUMP=/Applications/Postgres.app/Contents/Versions/16/bin/pg_dump ./s/generate-test-schema
```
