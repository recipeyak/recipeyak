import io
import os
import subprocess
from datetime import datetime
from typing import List

import click
from dotenv import load_dotenv
from typing_extensions import Literal

from cli import cmds
from cli.config import set_default_testing_variables as set_default_config
from cli.config import setup_django as configure_django
from cli.config import setup_django_sites
from cli.decorators import load_env, setup_django


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

    is_ci = bool(os.getenv("CI"))

    with ProcessManager() as m:
        if web or is_all:
            m.add_process("tslint", cmds.tslint())
            m.add_process("prettier", cmds.prettier(check=is_ci))
            m.add_process("typescript", cmds.typescript(watch=False))
            m.add_process("eslint", cmds.eslint(check=is_ci))

        if api or is_all:
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
        subprocess.run(cmds.typescript(watch=watch).split(), check=True)
        return
    if api:
        subprocess.run(cmds.mypy().split(), check=True)


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

    os.environ["TZ"] = "UTC"

    jest = ["node", "frontend/scripts/test.js", "--env=jsdom", *test_args]
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
        subprocess.run(jest, check=True)

    if api:
        subprocess.run(pytest, cwd="backend", check=True)


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
            "gunicorn",
            "-w",
            "3",
            "-b",
            "0.0.0.0:8000",
            "backend.asgi:application",
            "-k",
            "uvicorn.workers.UvicornWorker",
            "--access-logfile",
            "-",
            "--error-logfile",
            "-",
            "--capture-output",
            "--enable-stdio-inheritance",
            "--access-logformat",
            'request="%(r)s" request_time=%(L)s remote_addr="%(h)s" request_id=%({X-Request-Id}i)s response_id=%({X-Response-Id}i)s method=%(m)s protocol=%(H)s status_code=%(s)s response_length=%(b)s referer="%(f)s" process_id=%(p)s user_agent="%(a)s"',
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
@click.argument("backup", type=click.Path(exists=True))
@click.argument("database_name")
@click.option("--host", default="localhost")
@click.option("--port", default="5432")
@click.option("--database_username", default="postgres")
def create_db_from_backup(
    backup: str, host: str, port: str, database_name: str, database_username: str
) -> None:
    """
    Restore to recipeyak database using production backup.

    1. Search for database backup in s3: `aws s3 ls recipeyak-backups`

    2. Download database: `aws s3 cp s3://recipeyak-backups/2019-02-12T0227Z-db.sql.gz ~/Downloads`

    3. Restore using this utility: `yak create_db_from_backup ~/Downloads/2019-02-12T0227Z-db.sql.gz recipeyak`
    """

    # Create a new database using with the current time so it's unique
    date = int(datetime.now().timestamp())
    temp_db_name = f"db{date}"
    subprocess.run(
        [
            "psql",
            "-h",
            host,
            "-p",
            port,
            "-U",
            database_username,
            "-c",
            f"Create database {temp_db_name}",
        ],
        check=True,
    )

    # unzip backup and insert into database
    ps = subprocess.Popen(["gzip", "-d", backup, "-c"], stdout=subprocess.PIPE)
    subprocess.run(
        ["psql", "-h", host, "-p", port, "-U", database_username, "-d", temp_db_name],
        stdin=ps.stdout,
        check=True,
    )

    # # remove recipeyak table if it exists and rename our table to recipeyak
    subprocess.run(
        [
            "psql",
            "-h",
            host,
            "-p",
            port,
            "-U",
            database_username,
            "-c",
            f"DROP DATABASE IF EXISTS {database_name}",
        ],
        check=True,
    )
    subprocess.run(
        [
            "psql",
            "-h",
            host,
            "-p",
            port,
            "-U",
            database_username,
            "-c",
            f"ALTER DATABASE {temp_db_name} RENAME TO {database_name}",
        ],
        check=True,
    )
    click.echo(f"Successfully imported backup into database: {database_name}")
