# Backend

## Installation
```bash
# /backend/
pipenv install
```

## DEV
```bash
# /backend/
pipenv shell
export DEBUG=1 && \
python manage.py makemigrations && \
python manage.py migrate && \
python manage.py runserver
```

## TEST
```bash
# /backend/
pipenv shell
DEBUG=1 ptw -- --cov-config .coveragerc --cov --cov-report term:skip-covered --flake8
# with type checking
DEBUG=1 ptw -- --cov-config .coveragerc --cov --cov-report term:skip-covered --flake8 --mypy
```
