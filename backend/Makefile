dev:
	export DEBUG=1 && \
	pipenv run python manage.py makemigrations && \
	pipenv run python manage.py migrate && \
	pipenv run python manage.py runserver

install:
	pipenv install --dev

# no coverage or mypy as they are slow
test-dev:
	DEBUG=1 ptw --beforerun 'flake8' -- -s

test:
	# the standalone versions of flake8 and mypy are much faster than
	# the pytest plugins
	DEBUG=1 ptw --beforerun 'mypy  --config-file tox.ini . && flake8' -- --cov-config .coveragerc --cov --cov-report term:skip-covered -s

ci:
	pipenv run flake8 --format junit-xml --output-file ~/backend/reports/flake8.xml
	# https://github.com/python/mypy/issues/4233
	pipenv run mypy --config-file tox.ini --junit-xml ~/backend/reports/mypy.xml .
	pipenv run pytest --cov-config .coveragerc --cov --junit-xml ~/backend/reports/pytest.xml

upload-coverage:
	pipenv run codecov
