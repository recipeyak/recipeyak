dev:
	export DEBUG=1 && \
	pipenv run python manage.py makemigrations && \
	pipenv run python manage.py migrate && \
	pipenv run python manage.py runserver

install:
	pipenv install --dev --three

# no coverage or mypy as they are slow
test-dev:
	DEBUG=1 ptw -- --flake8

test:
	DEBUG=1 ptw -- --cov-config .coveragerc --cov --cov-report term:skip-covered --flake8 --mypy

ci:
	pipenv run pytest --cov-config .coveragerc --cov --flake8 --mypy --junit-xml ~/backend/reports/output.xml
