# Recipe Yak [![CircleCI](https://circleci.com/gh/recipeyak/recipeyak.svg?style=svg)](https://circleci.com/gh/recipeyak/recipeyak)
> Application to automate the selection of meals and creation of shopping lists.

## Why?

To have a centralized location where multiple people can organize a meal plan.

## Prior Art

- <https://www.paprikaapp.com>
- <http://thinkle.github.io/gourmet/>
- <http://krecipes.sourceforge.net>

## Dev

**Note:** postgres is required. Either run it via `docker-compose -f
docker-compose-dev.yml -d` or via the homebrew cask mac app.

```shell
# create a .env with `DEBUG=1`
cp .env-example .env
echo "DEBUG=1" >> .env

# frontend
cd frontend
yarn install
./s/run
./s/test
./s/lint
./s/fmt

# backend
cd backend
poetry install
./s/run
./s/test # or ./s/test --watch
./s/lint
./s/fmt
```

### Testing with OAuth

After dev setup, configure the identity provider to enable redirecting to
`http://localhost:3000/accounts/$providerName`.

## Prod
### Creating environment
You can create a remote docker machine on AWS using:
```shell
MACHINE_NAME='grunniens'
docker-machine create --driver amazonec2 $MACHINE_NAME
```

### Deploying containers

1. Copy `.env-example` to `.env` and add in the proper configuration variables
2. Configure OAuth with identity providers (leaving CLIENT_ID variables undefined will disable a provider)
3. Build containers `./build [frontend|react|backend|django|nginx]`
4. Upload containers to registry `./upload`
5. Deploy containers `./deploy $MACHINE_NAME`

### Maintenance mode

Enabling maintenance mode returns a 503 status code with a webpage explaining the site is down for maintenance.

- Enable `./maintenance_mode $MACHINE_NAME on`
- Disable `./maintenance_mode $MACHINE_NAME off`

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
-   [`OAUTH_xxxxx_CLIENT_ID`][github-oauth] — Client ID from OAuth provider for use on server and client.
    +   ex: `094809fsdf098123040`
- [`OAUTH_xxxxx_SECRET`][github-oauth] — Client secret from OAuth provider for use on server.
    + ex: `09482409fa234fsdf098d12d23d43d040`
- [`SENTRY_DSN`][sentry-dsn] — Sentry secret configuration for backend.
    + ex: `https://<key>:<secret>@sentry.io/<project>`
- [`FRONTEND_SENTRY_DSN`][sentry-dsn] — Sentry configuration for frontend.
    + ex: `https://<key>@sentry.io/<project>`

[django-secret]: https://docs.djangoproject.com/en/dev/ref/settings/#std:setting-SECRET_KEY
[sentry-dsn]: https://docs.sentry.io/quickstart/#about-the-dsn
[github-redirect-uri]: https://developer.github.com/apps/building-oauth-apps/authorization-options-for-oauth-apps/#redirect-urls
[github-oauth]: https://developer.github.com/apps/building-oauth-apps/authorization-options-for-oauth-apps/#web-application-flow
[drknox]: https://github.com/James1345/django-rest-knox
