# backend-rs

A Rust reimplemention of the API.


```sh
DEBUG=1 DATABASE_URL=postgres://postgres@localhost:5432/recipeyak STORAGE_HOSTNAME=images-cdn.recipeyak.com cargo run
curl -b sessionid=... 'localhost:8001/api/v1/calendar/?start=2026-09-06&end=2026-10-24'
```

Env vars: `DATABASE_URL`, `STORAGE_HOSTNAME`, `PORT` (default 8001), and
`DJANGO_SECRET_KEY` unless `DEBUG=1`, in which case the Django dev key is used.