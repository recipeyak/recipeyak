from docker_compose import Logger, Volume, Service, Compose

logging = Logger(
    driver="syslog",
    options={
        "syslog-address": "udp://logs.papertrailapp.com:50183",
        "tag": "{{.Name}}",
    },
)

pgdata = Volume(name="pgdata", driver="local")
django_static_files = Volume(name="django-static-files", driver="local")
react_static_files = Volume(name="react-static-files", driver="local")

db = Service(
    name="db",
    image="postgres:10.1",
    command=[
        "-c",
        "shared_preload_libraries=pg_stat_statements",
        "-c",
        "pg_stat_statements.max=10000",
        "-c",
        "pg_stat_statements.track=all",
    ],
    ports=[(5432, 5432)],
    logging=logging,
    volumes=[(pgdata, "/var/lib/postgresql/data")],
)

django = Service(
    name="django",
    restart="always",
    image="recipeyak/django:latest",
    env_file=[".env-production"],
    command="sh bootstrap-prod.sh",
    volumes=[(django_static_files, "/var/app/static-files")],
    logging=logging,
    depends_on=[db],
)

react = Service(
    name="react",
    image="recipeyak/react:latest",
    command="sh bootstrap.sh",
    env_file=[".env-production"],
    volumes=[(react_static_files, "/var/app/dist")],
    logging=logging,
)

nginx = Service(
    name="nginx",
    image="recipeyak/nginx:latest",
    ports=[(80, 80)],
    volumes=[
        (react_static_files, "/var/app/dist"),
        (django_static_files, "/var/app/django/static"),
    ],
    logging=logging,
    depends_on=[django, react],
)


def main():
    return Compose(
        version=3,
        services=[nginx, django, db, react],
        volumes=[pgdata, django_static_files, react_static_files],
    )

