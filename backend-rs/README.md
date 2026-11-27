# backend-rs

A Rust reimplemention of the API.


```sh
./s/dev  # loads env vars from ../backend/.env
curl -b sessionid=... 'localhost:8001/api/v1/calendar/?start=2026-09-06&end=2026-10-24'
```

Env vars, all prefixed with `RECIPEYAK_RS_`: `DATABASE_URL`, `STORAGE_HOSTNAME`,
`STORAGE_BUCKET_NAME`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`,
`ABLY_API_KEY` (realtime updates are skipped when unset), `PORT` (default
8001), `LOG` (a `tracing` filter, default `info`), and `SENTRY_DSN`,
`SENTRY_RELEASE`, `SENTRY_ENVIRONMENT` (Sentry is disabled when `SENTRY_DSN` is
unset).

## Porting an endpoint

1. Write its SQL in `queries/` and run `./s/generate-queries`.
2. Add a handler in `src/routes/<area>/<name>.rs` with a `#[utoipa::path]`
   that matches the Django view's path and `operation_id`. Take `Json`,
   `Path` and `Params` from `crate::extract`, and `db: Db` after any `User`,
   `Team` or `Calendar`. Use `db.transaction()` for multi-statement writes.
3. Register it in `router()` in `src/routes/<area>/mod.rs`. Handlers that
   share a path go in the same `routes!(...)`. A new area also needs a
   `.merge(<area>::router())` in `src/routes/mod.rs`.
4. Add it to the `$api_upstream` map in `infra/nginx/recipeyak.conf`.
   `tests/routing.rs` fails until you do.
5. Run `./s/generate-schema`, then `../backend/s/generate-client` to update
   the UI's API client. `tests/api_schema.rs` fails until you do. The Vite dev
   server routes to backend-rs based on this schema.
6. Add integration tests in `tests/<name>.rs`.

## Queries

SQL lives in `queries/`. [Cornucopia](https://github.com/cornucopia-rs/cornucopia)
type-checks it against `tests/schema/` and generates the `cornucopia/` crate.
Nullable result columns must be marked with `?` in the `--!` annotation.
Call queries that take more than one parameter with
`.params(&db, &FooParams { ... })` (import `cornucopia::client::Params as _`)
rather than `.bind(...)`, so arguments of the same type can't be swapped.
After changing a query or the schema, regenerate it:

```sh
cargo install cornucopia --version 1.0.1 --locked
./s/generate-queries
```

## Tests

Integration tests in `tests/` run the app against a fresh Postgres database
per test, created on the `RECIPEYAK_RS_DATABASE_URL` server (default
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
