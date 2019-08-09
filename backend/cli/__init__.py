import io
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Tuple

import click
from dotenv import load_dotenv
from typing_extensions import Literal

from cli import cmds
from cli.config import set_default_testing_variables as set_default_config
from cli.config import setup_django as configure_django
from cli.config import setup_django_sites
from cli.decorators import load_env, setup_django
from cli.docker_machine import docker_machine_env, docker_machine_unset_env


@click.group()
def cli():
    pass


# TODO(chdsbd): Remove frontend/backend differentiators for linting and
# formatting. We should differentiate based on language (Python, Typescript) or
# maybe formatters (Prettier, Black) since Prettier formats multiple languages.


@cli.command(help="lint code")
@click.option("-a", "--api/--no-api")
@click.option("-w", "--web/--no-web")
@click.pass_context
def lint(ctx: click.core.Context, api: bool, web: bool) -> None:
    """Lint code. Defaults to all."""
    is_all = not api and not web
    from cli.manager import ProcessManager

    load_dotenv()
    set_default_config()

    with ProcessManager() as m:
        if web or is_all:
            m.add_process("tslint", cmds.tslint())
            m.add_process("prettier", cmds.prettier(check=True))
            m.add_process("typescript", cmds.typescript(watch=False))

        if api or is_all:
            is_ci = bool(os.getenv("CI"))
            ctx.invoke(missing_migrations)
            m.add_process("mypy", cmds.mypy())
            m.add_process("flake8", cmds.flake8())
            m.add_process("black", cmds.black(check=is_ci))
            if is_ci:
                m.add_process("isort", "isort --check-only")
            else:
                m.add_process("isort", "isort -y")

            if is_ci:
                m.add_process("pylint", cmds.pylint())


@cli.command(help="typecheck code")
@click.option("-a", "--api/--no-api")
@click.option("-w", "--web/--no-web")
@click.option("--watch/--no-watch")
def typecheck(api: bool, web: bool, watch: bool) -> None:
    if not api and not web:
        raise click.ClickException("No services were selected.")

    if web:
        subprocess.run(cmds.typescript(watch=watch).split())
        return
    if api:
        subprocess.run(cmds.mypy().split())


@cli.command(help="format code")
@click.option("-a", "--api/--no-api")
@click.option("-w", "--web/--no-web")
@click.option("--check", is_flag=True)
def fmt(api: bool, web: bool, check: bool) -> None:
    """Format code. Defaults to all."""
    is_all = not api and not web
    from cli.manager import ProcessManager

    with ProcessManager() as m:
        if api or is_all:
            m.add_process("black", cmds.black(check=check))

        if web or is_all:
            m.add_process("prettier", cmds.prettier(check=check))


@cli.command(help="test services", context_settings=dict(ignore_unknown_options=True))
@click.option("-a", "--api/--no-api")
@click.option("-w", "--web/--no-web")
@click.option("--watch/--no-watch")
@click.argument("test_args", nargs=-1, type=click.UNPROCESSED)
@load_env
def test(api: bool, web: bool, watch: bool, test_args: List[str]) -> None:
    """Run tests for service. Defaults to all."""
    is_all = not api and not web
    from cli.manager import ProcessManager

    os.environ["TESTING"] = "1"

    jest = ["node", "frontend/scripts/test.js", "--env=jsdom"]
    if os.getenv("CI"):
        jest += ["--coverage", "--runInBand"]
    if watch:
        jest += ["--watch"]

    pytest = ["ptw", "--", *test_args] if watch else ["pytest", *test_args]

    if is_all:
        with ProcessManager() as m:
            m.add_process("api", pytest, cwd="backend")
            m.add_process("web", jest)

    if web:
        subprocess.run(jest)

    if api:
        subprocess.run(pytest, cwd="backend")


@cli.command(help="start dev services")
@click.option("-a", "--api/--no-api")
@click.option("-w", "--web/--no-web")
@click.option("--migrate", is_flag=True)
@click.pass_context
@setup_django
def dev(ctx: click.core.Context, api: bool, web: bool, migrate: bool) -> None:
    """
    Start dev services. Defaults to all.

    Only run the api server (--api) to enable stdin access for `ipdb`.
    """
    is_all = not (web or api)
    run_django = api or is_all
    run_web = web or is_all
    services = []
    if run_django:
        # start postgres
        if sys.platform == "darwin" and Path("/Applications/Postgres.app").exists():
            subprocess.run(["open", "/Applications/Postgres.app"])

        from django.core.management import call_command

        if migrate:
            call_command("migrate")
        setup_django_sites()
        services.append(("django", "yak django runserver"))
    if run_web:
        services.append(("webpack", "node frontend/scripts/start.js"))
    if not services:
        raise click.ClickException("No services were selected.")

    if run_django and not run_web:
        call_command("runserver")
        return

    from cli.manager import DefaultManager

    with DefaultManager() as m:
        for service in services:
            m.add_process(*service)


@cli.command(help="start prod services")
@load_env
def prod() -> None:
    """Start prod services. Defaults to all."""
    os.environ["PYTHONUNBUFFERED"] = "true"
    subprocess.run(
        [
            "uvicorn",
            "--host",
            "0.0.0.0",
            "--port",
            "8000",
            "--workers",
            "3",
            "backend.asgi:application",
        ],
        check=True,
    )


@cli.command(help="install dependencies/tools")
@click.option("-a", "--api/--no-api")
@click.option("-w", "--web/--no-web")
def install(api: bool, web: bool) -> None:
    """Install tools and dependencies. Defaults to all."""

    is_all = not api and not web
    from cli.manager import ProcessManager

    with ProcessManager() as m:
        if api or is_all:
            m.add_process("poetry", "poetry install")
        if web or is_all:
            m.add_process("yarn", "yarn install")


@cli.command(help="build services")
@click.option("--api/--no-api")
@click.option("--web/--no-web")
@load_env
def build(api: bool, web: bool) -> None:
    """Build services for deployment. Defaults to all."""
    is_all = not api and not web
    if web or is_all:
        subprocess.run(["node", "frontend/scripts/build.js"], check=True)
        subprocess.run(
            ["bash", "frontend/scripts/crawl.sh"],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

    if api or is_all:
        from django.core.management import call_command
        import platform

        os.environ["DOCKERBUILD"] = "1"
        configure_django()
        call_command("collectstatic", no_input=True)
        git_sha = os.environ["GIT_SHA"]
        # sed's `-i` flag behaves differently on macOS vs Linux
        sed_arg = ["-i", ""] if "darwin" in platform.system().lower() else ["-i"]
        subprocess.run(
            [
                "sed",
                *sed_arg,
                f"s#<%=GIT_SHA=%>#{git_sha}#",
                "backend/backend/settings.py",
            ],
            check=True,
        )
        # ensure we set the git_sha
        subprocess.run(["grep", git_sha, "backend/backend/settings.py"], check=True)


@cli.command(add_help_option=False, context_settings=dict(ignore_unknown_options=True))
@click.argument("management_args", nargs=-1, type=click.UNPROCESSED)
@click.pass_context
@setup_django
def django(ctx: click.core.Context, management_args: List[str]) -> None:
    """run django management commands"""
    from django.core.management import execute_from_command_line

    execute_from_command_line([ctx.command_path, *management_args])


@cli.command()
@setup_django
def django_setup_sites():
    """configure Django sites for recipe yak"""
    setup_django_sites()


@cli.command()
@setup_django
def missing_migrations() -> None:
    """check for missing django migrations"""
    from django.core.management import call_command

    try:
        # call command and swallow output
        call_command(
            "makemigrations",
            dry_run=True,
            no_input=True,
            check=True,
            stdout=io.StringIO(),
            stderr=io.StringIO(),
        )
    except SystemExit as e:
        if e.code != 0:
            raise click.ClickException(
                "Missing migrations. Run yak django makemigations to add missing migrations."
            )


@cli.command()
@click.option("--shell", is_flag=True, help="output env in shell format")
def env(shell: bool) -> None:
    """print environment"""
    output = []
    for key, value in os.environ.items():
        output.append(f"{key}: {value}")
    output.sort()
    click.echo("\n".join(output))


@cli.command()
@click.argument("machine_name")
@click.argument("action", type=click.Choice(["on", "off"]))
def maintenance_mode(machine_name: str, action: Literal["on", "off"]) -> None:
    """
    Setup prod to return a 503 status code with a webpage explaining the site is down for maintenance.
    """
    docker_machine_env(machine_name)

    if action == "on":
        click.echo("Enabling maintence mode")
        subprocess.run(
            [
                "docker-compose",
                "-f",
                "docker-compose-shipit.yml",
                "exec",
                "nginx",
                "touch",
                "maintenance_on",
            ]
        )
        click.echo("Maintenance mode: ON")
    if action == "off":
        click.echo("Disabling maintenance mode")
        subprocess.run(
            [
                "docker-compose",
                "-f",
                "docker-compose-shipit.yml",
                "exec",
                "nginx",
                "rm",
                "-f",
                "maintenance_on",
            ]
        )
        click.echo("Maintenance mode: OFF")


@cli.command()
@click.argument("backup", type=click.Path(exists=True))
@click.argument("database_name")
def create_db_from_backup(backup: str, database_name: str) -> None:
    """
    Restore to recipeyak database using production backup.

    1. Search for database backup in s3: `aws s3 ls recipeyak-backups`

    2. Download database: `aws s3 cp s3://recipeyak-backups/2019-02-12T0227Z-db.sql.gz ~/Downloads`

    3. Restore using this utility: `yak create_db_from_backup ~/Downloads/2019-02-12T0227Z-db.sql.gz recipeyak`
    """

    # Create a new database using with the current time so it's unique
    date = int(datetime.now().timestamp())
    temp_db_name = f"db{date}"
    subprocess.run(["psql", "-c", f"Create database {temp_db_name}"], check=True)

    # unzip backup and insert into database
    ps = subprocess.Popen(["gzip", "-d", backup, "-c"], stdout=subprocess.PIPE)
    subprocess.run(["psql", "-d", temp_db_name], stdin=ps.stdout, check=True)

    # # remove recipeyak table if it exists and rename our table to recipeyak
    subprocess.run(
        ["psql", "-c", f"DROP DATABASE IF EXISTS {database_name}"], check=True
    )
    subprocess.run(
        ["psql", "-c", f"ALTER DATABASE {temp_db_name} RENAME TO {database_name}"],
        check=True,
    )
    click.echo(f"Successfully imported backup into database: {database_name}")


@cli.command()
@click.argument("machine_name")
@click.argument("tag")
def deploy(machine_name: str, tag: str) -> None:
    """
    deploy the given `tag` to `machine_name`
    """
    docker_machine_env(machine_name)

    click.echo(f"Deploying tag ({tag}) to docker machine ({machine_name})")

    output_compose_file = "docker-compose-shipit.yml"

    # replace ':latest' with chosen tag
    with open(output_compose_file, "w") as f:
        subprocess.run(
            ["sed", "-e", f"s#:latest$#:{tag}#", "docker-compose-deploy.yml"],
            stdout=f,
            check=True,
        )

    # update containers
    subprocess.run(
        ["docker-compose", "-f", output_compose_file, "up", "--build", "-d"], check=True
    )


@cli.command()
@click.argument("machine_name")
def connect(machine_name: str) -> None:
    """
    connect via ssh to docker `machine_name`
    """
    docker_machine_env(machine_name)
    subprocess.run(["docker-machine", "ssh", machine_name])


@cli.command()
@click.option("--ignore-staged", is_flag=True)
@click.option("--web", is_flag=True)
@click.option("--api", is_flag=True)
@click.option("--nginx", is_flag=True)
@load_env
def docker_build(ignore_staged: bool, web: bool, api: bool, nginx: bool) -> None:
    """
    build prod containers
    """
    docker_machine_unset_env()

    git_changes = subprocess.check_output(["git", "status", "-s"])
    if git_changes and not ignore_staged:
        click.echo("Please stash your changes before building.")
        exit(1)

    project_root = Path(__file__).parent.parent.parent

    git_rev = subprocess.check_output(["git", "rev-parse", "HEAD"]).strip().decode()

    is_all = not any([web, api, nginx])

    def build_container(
        path: Path, name: str, build_args: Optional[List[Tuple[str, str]]] = None
    ) -> None:
        build_args = build_args or []

        args: List[str] = []
        for arg_name, arg_value in build_args:
            args += ["--build-arg", f"{arg_name}={arg_value}"]

        subprocess.run(
            [
                "docker",
                "build",
                "-f",
                path / "Dockerfile-prod",
                path,
                "--tag",
                f"recipeyak/{name}:{git_rev}",
                *args,
            ]
        )

    if web or is_all:
        OAUTH_VARS = [
            "OAUTH_BITBUCKET_CLIENT_ID",
            "OAUTH_FACEBOOK_CLIENT_ID",
            "OAUTH_GITHUB_CLIENT_ID",
            "OAUTH_GITLAB_CLIENT_ID",
            "OAUTH_GOOGLE_CLIENT_ID",
        ]

        oauth_args = [(arg, os.getenv(arg, "")) for arg in OAUTH_VARS]

        args = [
            *oauth_args,
            ("GIT_SHA", git_rev),
            ("FRONTEND_SENTRY_DSN", os.environ["FRONTEND_SENTRY_DSN"]),
        ]

        build_container(name="react", path=project_root / "frontend", build_args=args)

    if nginx or is_all:
        build_container(name="nginx", path=project_root / "nginx")

    if api or is_all:
        build_container(
            name="django",
            path=project_root / "backend",
            build_args=[("GIT_SHA", git_rev)],
        )


@cli.command()
def docker_upload() -> None:
    """
    upload prod images to container registry
    """
    docker_machine_unset_env()

    images = []
    for rows in subprocess.check_output(["docker", "images"]).decode().split("\n"):
        row = rows.split()
        if row and "recipeyak" in row[0]:
            images.append(row[0] + ":" + row[1])

    from cli.manager import ProcessManager

    with ProcessManager() as m:
        for img in images:
            m.add_process(img, "docker push " + img)
