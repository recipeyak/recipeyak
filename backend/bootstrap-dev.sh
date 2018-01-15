set -eux

# wait for databases
while ! nc -w 1 -z db 5432
    do sleep 0.1
done

# apply migrations
python manage.py migrate

# Configure server models
./manage.py shell < set_server.py

# start dev server
python manage.py runserver 0.0.0.0:8000
