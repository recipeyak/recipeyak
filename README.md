# Recipe Yak [![CircleCI](https://circleci.com/gh/recipeyak/recipeyak.svg?style=svg)](https://circleci.com/gh/recipeyak/recipeyak)
> Application to automate the selection of meals and creation of shopping lists.

## Dev

```
docker-compose -f docker-compose-dev.yml up
```

**NOTE:** delete `__pycache__/`, `*.pyc`, and `node_modules/` when using the dev
setup as .dockerignore files are only used with `ADD` and `COPY`

## Test

```
docker-compose -f docker-compose-dev.yml up
# frontend
# w/ watch mode
docker-compose -f docker-compose-dev.yml exec react npm run test src/
# w/ coverage (no watch mode)
docker-compose -f docker-compose-dev.yml exec react npm run test-cov src/

# backend
# quick dev test
docker-compose -f docker-compose-dev.yml exec backend make test-dev
# slow full test with mypy, pytest_cov, et al.
docker-compose -f docker-compose-dev.yml exec backend make test
```

## Creating environment
You can create a remote docker machine on AWS using:
```
docker-machine create --driver amazonec2 <machine-name>
```

## Deploying containers
You can switch your context to the remote machine using:
```
eval $(docker-machine env <machine-name>)
```
NOTE: Copy `.env-example` to `.env` and add in the proper configuration variables
```
docker-compose -f docker-compose-prod.yml build && \
docker-compose -f docker-compose-prod.yml down && \
docker-compose -f docker-compose-prod.yml up -d
```

## Maintenance mode
Enabling maintenance mode returns a 503 status code with a webpage explaining the site is down for maintenance.

### Enable maintenance mode
```bash
# /recipe-manager
./maintenance_mode.sh on
```

### Disable maintenance mode
```bash
# /recipe-manager
./maintenance_mode.sh off
```
[0]: https://docs.docker.com/engine/reference/builder/#dockerignore-file
