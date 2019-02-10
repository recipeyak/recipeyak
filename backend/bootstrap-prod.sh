set -eux

# copy static files to mounted volume (app/static => app/static-files)
cp -af static/* static-files

# wait for databases
bash wait-for-it.sh db:5432 -- echo 'Database available'

# apply migrations
poetry run ./manage.py migrate

# configure server models
poetry run ./manage.py shell < set_server.py

# start server
PYTHONUNBUFFERED=1 poetry run gunicorn -w 3 -b 0.0.0.0:8000 backend.wsgi --access-logfile - --error-logfile - --capture-output --enable-stdio-inheritance --access-logformat 'request="%(r)s" request_time=%(L)s remote_addr="%(h)s" request_id=%({X-Request-Id}i)s method=%(m)s protocol=%(H)s status_code=%(s)s response_length=%(b)s referer="%(f)s" process_id=%(p)s user_agent="%(a)s"'
