# Recipe Yak [![CircleCI](https://circleci.com/gh/recipeyak/recipeyak.svg?style=svg)](https://circleci.com/gh/recipeyak/recipeyak)

> Application to automate the selection of meals and creation of shopping lists.

## Why?

To have a centralized location where multiple people can organize a meal plan.

## Prior Art / Alternatives

- <https://www.paprikaapp.com>
- <https://www.anylist.com>
- <http://thinkle.github.io/gourmet/>
- <http://krecipes.sourceforge.net>
- <https://cinc.kitchen>
- <https://cookpad.com>
- <https://www.prepear.com>
- <https://www.mysaffronapp.com>
- <https://whisk.com>
- <https://grocy.info>
- <https://www.cooklist.co/>
- <https://recipekeeperonline.com>
- <https://github.com/KDE/kookbook>
- <https://mela.recipes>
- <https://www.copymethat.com>
- <https://github.com/TandoorRecipes/recipes>

## Dev

**Note:** postgres is required. Either run it via `docker-compose -f **docker-compose-dev.yml -d` or via the homebrew cask mac app.
[Yarn](https://yarnpkg.com/en/) and [Poetry](https://github.com/sdispater/poetry) (0.12) are required for frontend and backend installation.

```shell
# create a .env with `DEBUG=1`. Note: you may need to update database URIs and related vars.
cp .env-example .env
echo "DEBUG=1" >> .env

# initial cli setup (only need to do this once)
poetry install

frontend/s/dev
frontend/s/test
frontend/s/lint

backend/s/dev
backend/s/test
backend/s/lint

# use `yarn` and `poetry` to add and upgrade dependencies
yarn add $FOO
poetry add $BAR
```

### Testing with OAuth

After dev setup, configure the identity provider to enable redirecting to
`http://localhost:3000/accounts/$providerName`.

## Prod

### Deploy a new release

1. Copy `.env-example` to `.env` and add in the proper configuration variables
2. Configure OAuth with identity providers (leaving CLIENT_ID variables undefined will disable a provider)
3. [Install Ansible](https://docs.ansible.com/ansible/latest/index.html)
4. Setup [Ansible Inventory](https://docs.ansible.com/ansible/latest/user_guide/intro_inventory.html)

   ```yml
   ---
   all:
     hosts:
       recipeyak:
         ansible_host: 255.255.255.255
         ansible_user: root
   ```

5. Run the playbook

   ```shell
   ansible-playbook ./infrastructure/playbooks/deploy.yml
   ```

### Maintenance mode

Enabling maintenance mode returns a 503 status code with a webpage explaining the site is down for maintenance.

```shell
ansible-playbook ./infrastructure/playbooks/maintenance_mode.yml
```

## Configuration

Environment variables are used for configuration. Unless otherwise stated, a value is required.

- [`DJANGO_SECRET_KEY`][django-secret] — long, randomized string required for django
  - ex: `284urfljkdflsdf`
- `DATABASE_URL` — URL for Django's database
  - ex: `postgres://postgres@postgres:5432/postgres`
- `EMAIL_HOST` — SMTP hostname for sending email from Django
  - ex:`smtp.mailgun.org`
- `EMAIL_HOST_USER` — SMTP email for logging into server
  - ex: `server@example.com`
- `EMAIL_HOST_PASSWORD` — SMTP password for authenticating
  - ex: `SomeUnguessablePassword`
- [`OAUTH_xxxxx_CLIENT_ID`][github-oauth] — Client ID from OAuth provider for use on server and client.
  - ex: `094809fsdf098123040`
- [`OAUTH_xxxxx_SECRET`][github-oauth] — Client secret from OAuth provider for use on server.
  - ex: `09482409fa234fsdf098d12d23d43d040`
- [`SENTRY_DSN`][sentry-dsn] — Sentry secret configuration for backend.
  - ex: `https://<key>:<secret>@sentry.io/<project>`
- [`FRONTEND_SENTRY_DSN`][sentry-dsn] — Sentry configuration for frontend.
  - ex: `https://<key>@sentry.io/<project>`

[django-secret]: https://docs.djangoproject.com/en/dev/ref/settings/#std:setting-SECRET_KEY
[sentry-dsn]: https://docs.sentry.io/quickstart/#about-the-dsn
[github-redirect-uri]: https://developer.github.com/apps/building-oauth-apps/authorization-options-for-oauth-apps/#redirect-urls
[github-oauth]: https://developer.github.com/apps/building-oauth-apps/authorization-options-for-oauth-apps/#web-application-flow
[drknox]: https://github.com/James1345/django-rest-knox
