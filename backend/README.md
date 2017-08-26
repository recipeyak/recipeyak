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
python manage.py makemigrations && \
python manage.py migrate && \
python manage.py runserver
```

## TEST
```bash
# /backend/ (venv)
ptw -- --cov-config .coveragerc --cov
# with type checking
ptw -- --cov-config .coveragerc --cov --mypy
```
