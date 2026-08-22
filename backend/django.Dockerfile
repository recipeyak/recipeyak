# keep this >= 3.11.1: 3.11.0 can deadlock on exit when a daemon thread is
# killed mid GIL handoff (https://github.com/python/cpython/issues/96387)
# not slim: netifaces (via advocate) has no wheel past cp39, so it builds
# from source and needs a compiler
FROM python:3.11-bookworm@sha256:c17b9ca6def1a936e55c77f086aaaf5f6a6c5f4d2fb4b7ac8c0113ba94e8b6ab

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
RUN uv sync --frozen

COPY . /var/app
# Inject GIT SHA into settings file to track releases via Sentry
ARG GIT_SHA
RUN sh -c 'sed -i s/\<%=GIT_SHA=%\>/"$GIT_SHA"/ recipeyak/django/settings.py && grep GIT_SHA recipeyak/django/settings.py'

CMD ["/var/app/entrypoint.sh"]
