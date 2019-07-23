#!/usr/bin/env sh
set -eux

# copy static files to mounted volume (app/static => app/static-files)
cp -af static/* static-files

# wait for databases
/var/app/backend/wait-for-it.sh db:5432 -- echo 'Database available'

# apply migrations
poetry run yak django migrate

# configure server models
poetry run yak django-setup-sites

# start server
poetry run yak prod --api
