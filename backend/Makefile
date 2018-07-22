dev:
	export DEBUG=1 && \
	poetry run python manage.py makemigrations && \
	poetry run python manage.py migrate && \
	poetry run python manage.py runserver

install:
	poetry install --dev

# no coverage or mypy as they are slow
test-dev:
	DEBUG=1 ptw --beforerun 'flake8' -- -s

test:
	# the standalone versions of flake8 and mypy are much faster than
	# the pytest plugins
	DEBUG=1 ptw --beforerun 'mypy  --config-file tox.ini . && flake8' -- --cov-config .coveragerc --cov --cov-report term:skip-covered -s

ci:
	poetry run flake8
	# https://github.com/python/mypy/issues/4233
	poetry run mypy --config-file tox.ini --junit-xml ~/backend/reports/mypy.xml .
	poetry run pytest --cov-config .coveragerc --cov --junit-xml ~/backend/reports/pytest.xml

ci-stdout:
	poetry run flake8
	# https://github.com/python/mypy/issues/4233
	poetry run mypy --config-file tox.ini .
	poetry run pytest --cov-config .coveragerc --cov
