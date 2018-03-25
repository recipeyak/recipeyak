set -eux

cp -f /Pipfile.lock /app/Pipfile.lock

# wait for databases
bash wait-for-it.sh db:5432 -- echo 'Database available'

# apply migrations
python manage.py migrate

# Configure server models
./manage.py shell < set_server.py

# start dev server
python manage.py runserver 0.0.0.0:8000
