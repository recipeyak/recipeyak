# Recipe Yak [![CircleCI](https://circleci.com/gh/chdsbd/recipeyak.svg?style=svg&circle-token=6a3a7cfa1b08a293ddfe600500830b75347f0957)](https://circleci.com/gh/chdsbd/recipeyak)
> Application to automate the selection of meals and creation of shopping lists.

## Dev

```
docker-compose -y docker-compose-dev.yml up
```

**NOTE:** delete `__pycache__/`, `*.pyc`, and `node_modules/` when using the dev
setup as .dockerignore files are only used with `ADD` and `COPY`

## Test

```
docker-compose -y docker-compose-dev.yml up
# frontend
# w/ watch mode
docker-compose -y docker-compose-dev.yml exec react npm run test src/
# w/ coverage (no watch mode)
docker-compose -y docker-compose-dev.yml exec react npm run test-cov src/

# backend
# quick dev test
docker-compose -y docker-compose-dev.yml exec backend make test-dev
# slow full test with mypy, pytest_cov, et al.
docker-compose -y docker-compose-dev.yml exec backend make test
```

## Deploy

```
docker-compose -y docker-compose-dev.yml up --build
```

[0]: https://docs.docker.com/engine/reference/builder/#dockerignore-file
