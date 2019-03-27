from docker_compose import Volume, Service, Compose

pgdata = Volume(name="pgdata", driver="local")

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
    volumes=[(pgdata, "/var/lib/postgresql/data")],
)


def main():
    return Compose(version=3, services=[db], volumes=[pgdata])

