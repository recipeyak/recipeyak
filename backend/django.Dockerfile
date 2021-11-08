FROM python:3.7@sha256:d8718f4c8f28360c88d2d8b53681edb3c95e6a7bacedabd32eb5b1d120a75dc5

# Install Poetry
# update circleci jobs if you change this version
RUN set -ex && python3 -m pip install poetry==1.1.9 && \
    poetry config virtualenvs.in-project true

# Install Application into container
RUN set -ex && mkdir -p /var/app

WORKDIR /var/app

# Adding dependency files
COPY pyproject.toml pyproject.toml
COPY poetry.lock poetry.lock

# Install our dev dependencies
RUN poetry install

COPY backend /var/app
# Inject GIT SHA into settings file to track releases via Sentry
ARG GIT_SHA
RUN sh -c 'sed -i s/\<%=GIT_SHA=%\>/"$GIT_SHA"/ core/settings.py && grep GIT_SHA core/settings.py'

HEALTHCHECK CMD curl --fail http://localhost:8000/healthz

CMD ["/var/app/entrypoint.sh"]
