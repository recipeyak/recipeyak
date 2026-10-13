# backend-rs

A Rust reimplemention of the API.


```sh
./s/dev  # loads env vars from ../backend/.env
curl -b sessionid=... 'localhost:8001/api/v1/calendar/?start=2026-09-06&end=2026-10-24'
```

Env vars: `DATABASE_URL`, `STORAGE_HOSTNAME`, and `PORT` (default 8001).

## Queries

SQL lives in `queries/`. [Cornucopia](https://github.com/cornucopia-rs/cornucopia)
type-checks it against `tests/schema/` and generates the `cornucopia/` crate.
Nullable result columns must be marked with `?` in the `--!` annotation.
After changing a query or the schema, regenerate it:

```sh
cargo install cornucopia --version 1.0.1 --locked
./s/generate-queries
```

## Tests

Integration tests in `tests/` run the app against a fresh Postgres database
per test, created on the `DATABASE_URL` server (default
`postgres://postgres@localhost:5432/postgres`) from a template loaded with
`tests/schema/`:

```sh
./s/test
```

`tests/schema/0001_schema.sql` is generated from the Django migrations. After
adding a migration, regenerate it with a `pg_dump` matching the server version:

```sh
PG_DUMP=/Applications/Postgres.app/Contents/Versions/16/bin/pg_dump ./s/generate-test-schema
./s/generate-queries
```
