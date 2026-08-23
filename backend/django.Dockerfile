FROM python:3.14-bookworm@sha256:8771427e2ac3e39208c1632f17e8b09e464333d262844a03705cc5e0023c16e2

# Install uv
# update github actions if you change this version
RUN set -ex && python3 -m pip install uv==0.12.5

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
