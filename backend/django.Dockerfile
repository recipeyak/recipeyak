FROM python:3.11-slim-bullseye@sha256:6286a3059285256b485fa617640d0fe2f1df6e7b6248f75199cd815e4c4a1c41

# Install Poetry
# update circleci jobs if you change this version
RUN set -ex && python3 -m pip install pip==22.2.2 && \
    python3 -m pip install poetry==1.3.2 && \
    poetry config virtualenvs.in-project true

# Install Application into container
RUN set -ex && mkdir -p /var/app

WORKDIR /var/app

# Adding dependency files
COPY pyproject.toml pyproject.toml
COPY poetry.lock poetry.lock

# Install our dev dependencies
RUN poetry run pip install setuptools==61.1.1 && \
    poetry install

COPY . /var/app
# Inject GIT SHA into settings file to track releases via Sentry
ARG GIT_SHA
RUN sh -c 'sed -i s/\<%=GIT_SHA=%\>/"$GIT_SHA"/ recipeyak/django/settings.py && grep GIT_SHA recipeyak/django/settings.py'

HEALTHCHECK CMD curl --fail http://localhost:8000/healthz

CMD ["/var/app/entrypoint.sh"]
