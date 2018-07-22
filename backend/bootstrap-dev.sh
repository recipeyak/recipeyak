set -eux

# export variables from .env-dev
set -a
source .env-dev
set +a

export DEBUG=1

# apply migrations
python manage.py migrate

# Configure server models
./manage.py shell < set_server.py

# start dev server
python manage.py runserver 0.0.0.0:8000
