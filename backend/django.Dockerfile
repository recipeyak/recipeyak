# keep this >= 3.11.1: 3.11.0 can deadlock on exit when a daemon thread is
# killed mid GIL handoff (https://github.com/python/cpython/issues/96387)
FROM python:3.11-slim-bookworm@sha256:2e32f7d302adc1c37428355c1e646897c0c53f4fd60b6a551245fb90ee129f91

# Install uv
# update github actions if you change this version
RUN set -ex && python3 -m pip install pip==22.2.2 && \
    python3 -m pip install uv==0.4.5

# Install Application into container
RUN set -ex && mkdir -p /var/app

WORKDIR /var/app

# Adding dependency files
COPY pyproject.toml pyproject.toml
COPY uv.lock uv.lock

# Install our dev dependencies
# netifaces (via advocate) has no wheel past cp39 so it builds from source, and
# unlike bullseye, bookworm-slim doesn't ship a compiler
RUN set -ex && \
    apt-get update && \
    apt-get install -y --no-install-recommends gcc libc6-dev && \
    uv sync --frozen && \
    apt-get purge -y --auto-remove gcc libc6-dev && \
    rm -rf /var/lib/apt/lists/*

COPY . /var/app
# Inject GIT SHA into settings file to track releases via Sentry
ARG GIT_SHA
RUN sh -c 'sed -i s/\<%=GIT_SHA=%\>/"$GIT_SHA"/ recipeyak/django/settings.py && grep GIT_SHA recipeyak/django/settings.py'

CMD ["/var/app/entrypoint.sh"]
