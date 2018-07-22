set -eux

cp -f /pyproject.lock /app/pyproject.lock

# wait for databases
bash wait-for-it.sh db:5432 -- echo 'Database available'

# apply migrations
poetry run ./manage.py migrate

# Configure server models
poetry run ./manage.py shell < set_server.py

# start dev server
poetry run ./manage.py runserver 0.0.0.0:8000
