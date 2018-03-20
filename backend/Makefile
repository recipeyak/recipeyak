dev:
	export DEBUG=1 && \
	pipenv run python manage.py makemigrations && \
	pipenv run python manage.py migrate && \
	pipenv run python manage.py runserver

install:
	pipenv install --dev --three

# no coverage or mypy as they are slow
test-dev:
	DEBUG=1 ptw --beforerun 'flake8' -- -s

test:
	DEBUG=1 ptw --beforerun 'mypy  --config-file tox.ini . && flake8' -- --cov-config .coveragerc --cov --cov-report term:skip-covered -s

ci:
	pipenv run flake8
	pipenv run mypy --config-file tox.ini .
	pipenv run pytest --cov-config .coveragerc --cov --junit-xml ~/backend/reports/output.xml
