# Recipe Yak [![CircleCI](https://circleci.com/gh/recipeyak/recipeyak.svg?style=svg)](https://circleci.com/gh/recipeyak/recipeyak)
> Application to automate the selection of meals and creation of shopping lists.

## Dev
1. Create an `.env-dev` file. It can be empty.
2. Startup dev environment
```
docker-compose -f docker-compose-dev.yml up -d
```

### Using `pdb` with
```
docker-compose -f docker-compose-dev.yml up -d && \
docker-compose -f docker-compose-dev.yml kill django && \
docker-compose -f docker-compose-dev.yml run -d --entrypoint "tail -f /dev/null" django && \
docker-compose -f docker-compose-dev.yml exec django sh boostrap-dev.sh
```

### Testing OAuth
1. create an `.env-dev` file based on `.env-example` with proper redirect uri's for local development.
2. Configure the identity provider to enable the correct redirect url.

**NOTE:** delete `__pycache__/`, `*.pyc`, and `node_modules/` when using the dev
setup as .dockerignore files are only used with `ADD` and `COPY`

## Test

```
docker-compose -f docker-compose-dev.yml up
# frontend
# w/ watch mode
docker-compose -f docker-compose-dev.yml exec react npm run test
# w/ coverage (no watch mode)
docker-compose -f docker-compose-dev.yml exec react npm run test-cov

# backend
# quick dev test
docker-compose -f docker-compose-dev.yml exec backend make test-dev
# slow, full test with mypy, pytest_cov, et al.
docker-compose -f docker-compose-dev.yml exec backend make test
```

## Production
### Creating environment
You can create a remote docker machine on AWS using:
```
MACHINE_NAME='grunniens'
docker-machine create --driver amazonec2 $MACHINE_NAME
```

### Deploying containers

1. Switch your context to the remote machine using:
```
eval $(docker-machine env $MACHINE_NAME)
```

2. Copy `.env-example` to `.env` and add in the proper configuration variables
3. Configure OAuth with identity providers (leaving variables undefined will disable a provider)
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

## Configuration
Environment variables are used for configuration. Unless otherwise stated, a value is required.

- [`DJANGO_SECRET_KEY`][django-secret] — long, randomized string required for django
    + ex: `284urfljkdflsdf`
- `DATABASE_URL` — URL for Django's database
    + ex: `postgres://postgres@db:5432/postgres`
- `EMAIL_HOST` — SMTP hostname for sending email from Django
    + ex:`smtp.mailgun.org`
- `EMAIL_HOST_USER` — SMTP email for logging into server
    + ex: `server@example.com`
- `EMAIL_HOST_PASSWORD` — SMTP password for authenticating
    + ex: `SomeUnguessablePassword`
- [`OAUTH_xxxxx_REDIRECT_URI`][github-redirect-uri] — OAuth redirect uri
    + ex: `http://example.com/accounts/github/`
-   [`OAUTH_xxxxx_CLIENT_ID`][github-oauth] — Client ID from OAuth provider
    +   ex: `094809fsdf098123040`
- [`OAUTH_xxxxx_SECRET`][github-oauth] — Client secret from OAuth provider
    + ex: `09482409fa234fsdf098d12d23d43d040`
- [`SENTRY_DSN`][sentry-dsn] — Sentry secret configuration
    + ex: `https://<key>:<secret>@sentry.io/<project>`
- [`FRONTEND_SENTRY_DSN`][sentry-dsn] — Sentry configuration for public facing code
    + ex: `https://<key>@sentry.io/<project>`

[0]: https://docs.docker.com/engine/reference/builder/#dockerignore-file
[django-secret]: https://docs.djangoproject.com/en/dev/ref/settings/#std:setting-SECRET_KEY
[sentry-dsn]: https://docs.sentry.io/quickstart/#about-the-dsn
[github-redirect-uri]: https://developer.github.com/apps/building-oauth-apps/authorization-options-for-oauth-apps/#redirect-urls
[github-oauth]: https://developer.github.com/apps/building-oauth-apps/authorization-options-for-oauth-apps/#web-application-flow
