# wait for database
while ! nc -w 1 -z db 5432
    do sleep 0.1
done
python manage.py collectstatic --noinput
python manage.py migrate
./manage.py shell < set_server.py
PYTHONUNBUFFERED=1 gunicorn -w 3 -b 0.0.0.0:8000 backend.wsgi --access-logfile - --error-logfile - --capture-output --enable-stdio-inheritance
