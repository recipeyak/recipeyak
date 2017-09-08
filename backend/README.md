# Backend

## Installation
```bash
# /backend/
python3 -m venv venv && \
source venv/bin/activate && \
pip install -r requirements.txt
```

## DEV
```bash
# /backend/ (venv)
export DEBUG=1 && \
python manage.py makemigrations && \
python manage.py migrate && \
python manage.py runserver
```

## TEST
```bash
# /backend/ (venv)
DEBUG=1 ptw -- --cov-config .coveragerc --cov --cov-report term:skip-covered --flake8
# with type checking
DEBUG=1 ptw -- --cov-config .coveragerc --cov --cov-report term:skip-covered --flake8 --mypy
```
