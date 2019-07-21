FROM recipeyak/base:v3


# Install Application into container
RUN set -ex && mkdir -p /var/app

WORKDIR /var/app
COPY . /var/app

# Install our dev dependencies
RUN poetry install

COPY backend /var/app
ARG GIT_SHA
RUN poetry run yak build --api
HEALTHCHECK CMD curl --fail http://localhost:8000/healthz

CMD ["/var/app/backend/bootstrap.sh"]
