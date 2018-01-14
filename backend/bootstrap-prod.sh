set -eux

# copy static files to mounted volume (app/static => app/static-files)
cp -af static/* static-files

# wait for database
while ! nc -w 1 -z db 5432
    do sleep 0.1
done

# apply migrations
python manage.py migrate

# configure server models
./manage.py shell < set_server.py

# start server
PYTHONUNBUFFERED=1 gunicorn -w 3 -b 0.0.0.0:8000 backend.wsgi --access-logfile - --error-logfile - --capture-output --enable-stdio-inheritance
