from typing import List
import subprocess
import os
import io

import click

from cli.config import setup_django_sites, setup_django as configure_django
from cli.decorators import setup_django, load_env
from cli import cmds


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

    with ProcessManager() as m:
        if web or is_all:
            m.add_process("tslint", cmds.tslint())
            m.add_process("prettier", cmds.prettier(check=True))
            m.add_process("typescript", cmds.typescript())

        if api or is_all:
            ctx.invoke(missing_migrations)
            m.add_process("mypy", cmds.mypy())
            m.add_process("flake8", cmds.flake8())
            m.add_process("black", cmds.black(check=True))

            if os.getenv("CI"):
                m.add_process("pylint", cmds.pylint())


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


@cli.command(help="test services")
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

    with ProcessManager() as m:
        if api or is_all:
            m.add_process(
                "api", cmds.pytest(watch=watch, args=test_args), cwd="backend"
            )

        if web or is_all:
            m.add_process("web", cmds.jest())


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
@click.option("-a", "--api/--no-api")
@click.option("-w", "--web/--no-web")
@load_env
def prod(api: bool, web: bool) -> None:
    """Start prod services. Defaults to all."""
    os.environ["PYTHONUNBUFFERED"] = "true"
    subprocess.run(
        [
            "gunicorn",
            "-w 3",
            "-b 0.0.0.0:8000",
            "backend.wsgi",
            "--access-logfile -",
            "--error-logfile -",
            "--capture-output",
            "--enable-stdio-inheritance",
            '--access-logformat=\'request="%(r)s" request_time=%(L)s remote_addr="%(h)s" request_id=%({X-Request-Id}i)s response_id=%({X-Response-Id}i)s method=%(m)s protocol=%(H)s status_code=%(s)s response_length=%(b)s referer="%(f)s" process_id=%(p)s user_agent="%(a)s"\'',
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

        os.environ["DOCKERBUILD"] = "1"
        configure_django()
        call_command("collectstatic", no_input=True)
        git_sha = os.environ["GIT_SHA"]
        subprocess.run(
            [
                "sed",
                "-i ''",
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
