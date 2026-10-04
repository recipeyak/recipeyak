# backend-rs

A Rust ([Axum](https://github.com/tokio-rs/axum) + [sqlx](https://github.com/launchbadge/sqlx))
port of the Django API in `../backend`, migrated endpoint by endpoint.

Django still owns the database schema (migrations) and authentication. This
service reads Django's session cookie directly, verifying the session's
signature and auth hash with the shared `DJANGO_SECRET_KEY`.

nginx routes ported endpoints here and everything else to Django, see
`../infra/nginx/recipeyak.conf`.

## development

```bash
# apply the Django migrations to your database, see ../backend/README.md

export DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/postgres
# must match Django's SECRET_KEY, which is hardcoded when DEBUG=1
export DJANGO_SECRET_KEY='+p(5+wb+(l2$@iv!1*3=5xnrw2gvi+l$kuo9s7=u6*)ri4v6as'
export STORAGE_HOSTNAME=images-cdn.recipeyak.com

# start api server on 127.0.0.1:8001 (override with BIND_ADDR)
cargo run

# run tests, needs a database with the Django migrations applied
s/test

# lint & format
cargo clippy --all-targets -- -D warnings
cargo fmt

# regenerate .sqlx after changing a query or the schema
cargo install sqlx-cli --version 0.9.0 --locked --no-default-features --features rustls,postgres
s/prepare
```

Logging is configured with `RUST_LOG`, e.g. `RUST_LOG=recipeyak=debug,tower_http=debug`.

## porting an endpoint

1. Add a handler in `src/routes/`, registering it in `src/routes/mod.rs`.
   Take an `AuthUser` argument to require authentication.
2. Match the Django response exactly, including the error shape (`ApiError`)
   and datetime format (`json::serialize_option_datetime`).
3. Add integration tests in `tests/`.
4. Run `s/prepare` and commit the `.sqlx` changes.
5. Route the endpoint to `localhost:8001` in `../infra/nginx/recipeyak.conf`
   and to `127.0.0.1:8001` in `../frontend/vite.config.ts`.
6. Once it has been running in production for a while, delete the Django view.
