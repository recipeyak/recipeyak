# backend api

## development

```bash
# use pyenv to automatically set python version based on .python-version.

# install dependencies.
uv sync

# restore production backup from s3.
s/db_download_backup

# Copy env. Borrow a full .env from an existing developer.
# Set your DATABASE_URL to the URL from s/db_download_backup.
cp .env-example .env

# start api server.
s/dev
```
