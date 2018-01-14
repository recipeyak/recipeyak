# Recipe Yak [![CircleCI](https://circleci.com/gh/recipeyak/recipeyak.svg?style=svg)](https://circleci.com/gh/recipeyak/recipeyak)
> Application to automate the selection of meals and creation of shopping lists.

## Dev

```
docker-compose -f docker-compose-dev.yml up
```

### Testing OAuth
1. create an `.env-dev` file based on `.env-dev-example`
2. Configure the identity provider to enable the correct redirect url.
3. Update `settings.js` to reflect identity provider settings

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

## Production
### Creating environment
You can create a remote docker machine on AWS using:
```
docker-machine create --driver amazonec2 <machine-name>
```

### Deploying containers

1. Switch your context to the remote machine using:
```
eval $(docker-machine env <machine-name>)
```

2. Copy `.env-example` to `.env` and add in the proper configuration variables
3. Configure OAuth
    - Configure the identity provider to enable the correct redirect url
    - Update `.env` and `settings.js` to match identity provider settings
4. Start containers
```
docker-compose -f docker-compose-prod.yml up --build -d
```

### Maintenance mode
Enabling maintenance mode returns a 503 status code with a webpage explaining the site is down for maintenance.

#### Enable maintenance mode
```bash
# /recipe-manager
./maintenance_mode.sh on
```

#### Disable maintenance mode
```bash
# /recipe-manager
./maintenance_mode.sh off
```
[0]: https://docs.docker.com/engine/reference/builder/#dockerignore-file
