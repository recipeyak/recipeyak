# AGENTS.md

## Local setup

Requires docker, [uv](https://docs.astral.sh/uv/), and npm. Run from the repo
root. You can skip the Rust API (`backend-rs/`).

```shell
# fake S3 for image uploads. Add `db` if you don't have postgres on :5432.
docker compose -f docker-compose-dev.yml up --detach s3

# only with your own postgres; the compose one creates it
createdb -U postgres recipeyak

cp backend/.env-example backend/.env
(cd backend && uv sync && ./.venv/bin/python manage.py migrate)
(cd frontend && npm install)
```

Start each server in its own terminal (or in the background):

```shell
(cd backend && ./s/dev)
(cd frontend && BROWSER=none ./s/dev)
```

Open http://localhost:5173 and sign up with any email. To import a recipe, go
to `/recipes/add` and paste a URL such as
https://cooking.nytimes.com/recipes/1025009-lasagna-soup.

## Tests

```shell
(cd backend && ./s/test)
(cd frontend && ./s/test)
```
