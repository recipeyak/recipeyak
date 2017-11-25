# wait for databases
while ! nc -w 1 -z db 5432
    do sleep 0.1
done
python manage.py migrate
./manage.py shell < set_server.py
python manage.py runserver 0.0.0.0:8000
