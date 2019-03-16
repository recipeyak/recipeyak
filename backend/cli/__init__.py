from typing import List
import subprocess
import os
import sys
import io

import click

from cli.config import setup_django_sites, setup_django as configure_django
from cli.decorators import setup_django, env


@click.group()
def cli():
    pass


# TODO(chdsbd): Remove frontend/backend differentiators for linting and
# formatting. We should differentiate based on language (Python, Typescript) or
# maybe formatters (Prettier, Black) since Prettier formats multiple languages.


def prettier(check: bool) -> str:
    check_flag = "--list-different" if check else "--write"
    glob = "frontend/**/*.{js,jsx,scss,css,ts,tsx,json}"
    return f"$(yarn bin)/prettier '{glob}' {check_flag}"


def mypy() -> str:
    from pathlib import Path

    files = " ".join(
        str(p)
        for p in Path("backend").rglob("*.py")
        if ".ropeproject" not in str(p) and ".venv" not in str(p)
    )

    return f"mypy --config-file tox.ini {files}"


def pylint() -> str:
    from pathlib import Path

    python_dirs = " ".join(
        list(str(p.parent) for p in Path("backend").glob("*/__init__.py"))
    )
    return f"pylint --rcfile='.pylintrc' {python_dirs}"


def black(check: bool) -> str:
    check_flag = "--check" if check else ""
    return f"black . {check_flag}"


def tslint() -> str:
    return "$(yarn bin)/tslint --project tsconfig.json --format 'codeFrame'"


def typescript() -> str:
    return "$(yarn bin)/tsc --noEmit"


def flake8() -> str:
    return "flake8 ."


def pytest(watch: bool, args: List[str]) -> str:
    args_str = " ".join(args)
    if watch:
        return f"ptw -- {args_str}"

    return f"pytest {args_str}"


def jest() -> str:
    if os.getenv("CI"):
        return "node scripts/test.js --env=jsdom --coverage --runInBand"
    return "node scripts/test.js --env=jsdom"


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
            m.add_process("tslint", tslint())
            m.add_process("prettier", prettier(check=True))
            m.add_process("typescript", typescript())

        if api or is_all:
            ctx.invoke(missing_migrations)
            m.add_process("mypy", mypy())
            m.add_process("flake8", flake8())
            m.add_process("black", black(check=True))

            if os.getenv("CI"):
                m.add_process("pylint", pylint())


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
            m.add_process("black", black(check=check))

        if web or is_all:
            m.add_process("prettier", prettier(check=check))


@cli.command(help="test services")
@click.option("-a", "--api/--no-api")
@click.option("-w", "--web/--no-web")
@click.option("--watch/--no-watch")
@click.argument("test_args", nargs=-1, type=click.UNPROCESSED)
@env
def test(api: bool, web: bool, watch: bool, test_args: List[str]) -> None:
    """Run tests for service. Defaults to all."""
    is_all = not api and not web
    from cli.manager import ProcessManager
    os.environ["TESTING"] = "1"

    with ProcessManager() as m:
        if api or is_all:
            m.add_process("api", pytest(watch=watch, args=test_args), cwd="backend")

        if web or is_all:
            m.add_process("web", jest())


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

    from honcho.manager import Manager

    m = Manager()
    for service in services:
        m.add_process(*service)
    m.loop()

    sys.exit(m.returncode)


@cli.command(help="start prod services")
@click.option("-a", "--api/--no-api")
@click.option("-w", "--web/--no-web")
@env
def prod(api: bool, web: bool) -> None:
    """Start prod services. Defaults to all."""
    is_all = not api and not web
    from cli.manager import DefaultManager
    from subprocess import list2cmdline

    with DefaultManager() as m:
        if api or is_all:
            m.add_process(
                "gunicorn",
                list2cmdline(
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
                    ]
                ),
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
def build(api: bool, web: bool) -> None:
    """Build services for deployment. Defaults to all."""

    from dotenv import load_dotenv

    load_dotenv()

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

        configure_django()
        os.environ["DOCKERBUILD"] = "1"
        call_command("collectstatic", no_input=True)
        git_sha = os.environ["GIT_SHA"]
        subprocess.run(
            [f"sed -i s/\<%=GIT_SHA=%\>/{git_sha}/ backend/settings.py"], check=True
        )
        subprocess.run(["grep GIT_SHA backend/settings.py"], check=True)


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
def missing_migrations() -> None:
    """Check for missing django migrations"""
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
