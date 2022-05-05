# Recipe Yak [![CircleCI](https://circleci.com/gh/recipeyak/recipeyak.svg?style=svg)](https://circleci.com/gh/recipeyak/recipeyak)

> Application to automate the selection of meals and creation of shopping lists.

## Why?

To have a centralized location where multiple people can organize a meal plan.

## Prior Art / Alternatives

| name                                                                                                          | created                                                                                                                                                                    | open source? |
| ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| [Meal Master](https://web.archive.org/web/20090327150531/http://episoft.home.comcast.net/~episoft/mmdesc.htm) | [1986](https://outpostbbs.net/mealmaster.html)                                                                                                                             | ❌           |
| [MasterCook](https://mastercook.com)                                                                          | [1992](https://support.mastercook.com/hc/en-us/articles/115001859663-MasterCook-Content-History)                                                                           | ❌           |
| [Home Cookin](https://web.archive.org/web/20120125063353/http://www.homecookinrecipesoftware.com:80/)         | [1992](https://web.archive.org/web/20120125063353/http://www.homecookinrecipesoftware.com:80/)                                                                             | ❌           |
| [Cookpad](https://cookpad.com/)                                                                               | [1998-03-01](https://en.wikipedia.org/wiki/Cookpad)                                                                                                                        | ❌           |
| [Cook'n](http://www.dvo.com)                                                                                  | [1999-05-27](https://web.archive.org/web/20000304113044/http://www.dvo.com/)                                                                                               | ❌           |
| [LargoRecipes](https://sourceforge.net/projects/largorecipes/)                                                | [2001-04](https://web.archive.org/web/20071023070658/http://www.recipewebservice.com/largorecipes/umldocs/parserclassdocs/src-html/IngredientAmountParser.html)            | ✅           |
| [Krecipes](http://krecipes.sourceforge.net)                                                                   | [2003-05-01](https://sourceforge.net/projects/krecipes/)                                                                                                                   | ✅           |
| [Big Oven](https://www.bigoven.com)                                                                           | [2004-02-04](https://web.archive.org/web/20040204023915/http://www.bigoven.com:80/index.htm)                                                                               | ❌           |
| [Mac Gourmet](https://web.archive.org/web/20080705134330/http://www.macgourmet.com/)                          | [2004-06-05](https://web.archive.org/web/20080705020658/http://www.macgourmet.com/release_notes/2004_06_01_macgourmet-release.html)                                        | ❌           |
| [Gourmet](http://thinkle.github.io/gourmet/)                                                                  | [2004-06-14](https://github.com/thinkle/gourmet/commit/76974abe13839ef3077456238fd163325cbb09da#diff-aac07aefec754086f5c344e2c233862f6a611c739b5647fd456c1b77d3577c79R247) | ✅           |
| [REML](https://sourceforge.net/projects/reml/)                                                                | [2005-03-02](https://sourceforge.net/projects/reml/files/reml%20Source/reml-ref%20Source%200.2/)                                                                           | ❌           |
| [Connoisseur](https://web.archive.org/web/20080811205757/http://www.connoisseurx.com:80/)                     | [2008-08-06](https://web.archive.org/web/20080811205757/http://www.connoisseurx.com:80/)                                                                                   | ❌           |
| [Yum Mac](https://web.archive.org/web/20081113150814/http://yum-mac.com:80/)                                  | [2008](https://web.archive.org/web/20081113150814/http://yum-mac.com:80/)                                                                                                  | ❌           |
| [Chicken Ping](http://web.archive.org/web/20090701031430/http://www.chickenping.com:80/)                      | [2009-06-22](http://web.archive.org/web/20090701031430/http://www.chickenping.com:80/)                                                                                     | ❌           |
| [Paprika](https://www.paprikaapp.com)                                                                         | [2010-08-16](https://www.whois.com/whois/paprikaapp.com)                                                                                                                   | ❌           |
| [Foodie](https://web.archive.org/web/20120220143348/http://foodiesharing.com/)                                | [2011](https://web.archive.org/web/20111129053047/http://foodiesharing.com:80/)                                                                                            | ❌           |
| [Copy Me That](https://www.copymethat.com)                                                                    | [2011-03-19](https://www.whois.com/whois/copymethat.com)                                                                                                                   | ❌           |
| [Anylist](https://www.anylist.com)                                                                            | [2012-04-04](https://twitter.com/AnyListApp)                                                                                                                               | ❌           |
| [Whisk](https://whisk.com)                                                                                    | [2013](https://whisk.com/about/)                                                                                                                                           | ❌           |
| [Recipe Keeper](https://recipekeeperonline.com)                                                               | [2015-06-24](https://www.whois.com/whois/recipekeeperonline.com)                                                                                                           | ❌           |
| [Cinc](https://cinc.kitchen)                                                                                  | [2016-03-31](https://www.whois.com/whois/cinc.kitchen)                                                                                                                     | ❌           |
| [Grocy](https://grocy.info)                                                                                   | [2017-04-15](https://github.com/grocy/grocy/commit/d414c8702ef5fb4037a7f147a2fdda7e47989125)                                                                               | ✅           |
| [Cooklist](https://www.cooklist.co/)                                                                          | [2017-05-26](https://www.whois.com/whois/cooklist.co)                                                                                                                      | ❌           |
| [Prepear](https://www.prepear.com)                                                                            | [2017-11-09](https://web.archive.org/web/20171204225008/https://prepear.com/)                                                                                              | ❌           |
| [Saffron](https://www.mysaffronapp.com)                                                                       | [2017-12-04](https://www.whois.com/whois/mysaffronapp.com)                                                                                                                 | ❌           |
| [Tandoor](https://github.com/TandoorRecipes/recipes)                                                          | [2018-01-31](https://github.com/TandoorRecipes/recipes/commit/598e0b1c698d14ca5ed75674b6ce92edaba3d6e4)                                                                    | ✅           |
| [Recipe Sage](https://github.com/julianpoy/RecipeSage)                                                        | [2018-02-18](https://github.com/julianpoy/RecipeSage/commit/b89e3575f839a20b849f40b5ca0208619524bb57)                                                                      | ✅           |
| [KookBook](https://github.com/KDE/kookbook)                                                                   | [2018-04-24](https://github.com/KDE/kookbook/commit/94f6b8bb07e248b6bb01d694c7ea673c161006bf)                                                                              | ✅           |
| [AnyMeal](https://github.com/wedesoft/anymeal)                                                                | [2020-05-07](https://github.com/wedesoft/anymeal/commit/74ac6865b7b9364f0e68e15c96962221b8f2dc0d)                                                                          | ✅           |
| [Mealie](https://github.com/hay-kot/mealie/)                                                                  | [2020-12-24](https://github.com/hay-kot/mealie/commit/beed8576c2d0499f8db443d39a8e89a37590a126)                                                                            | ✅           |
| [Mela](https://mela.recipes)                                                                                  | [2021-03-15](https://www.whois.com/whois/mela.recipes)                                                                                                                     | ❌           |
| [CookTime](https://letscooktime.com)                                                                          | [2022-04-10](https://www.whois.com/whois/letscooktime.com)                                                                                                                 | ❌           |

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
