FROM python:3.11-slim-bullseye@sha256:6286a3059285256b485fa617640d0fe2f1df6e7b6248f75199cd815e4c4a1c41

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
