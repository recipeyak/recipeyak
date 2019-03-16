import os
import click

from cli.config import setup_django, setup_django_sites


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


@cli.command(help="lint code")
@click.option("-a", "--api/--no-api")
@click.option("-w", "--web/--no-web")
def lint(api: bool, web: bool) -> None:
    """Lint code. Defaults to all."""
    is_all = not api and not web
    from cli.manager import ProcessManager

    m = ProcessManager()

    if web or is_all:
        m.add_process("tslint", tslint())
        m.add_process("prettier", prettier(check=True))
        m.add_process("typescript", typescript())

    if api or is_all:
        m.add_process("mypy", mypy())
        m.add_process("flake8", flake8())
        m.add_process("black", black(check=True))

        if os.getenv("CI"):
            m.add_process("pylint", pylint())

    m.loop()


@cli.command(help="format code")
@click.option("-a", "--api/--no-api")
@click.option("-w", "--web/--no-web")
@click.option("--check", is_flag=True)
def fmt(api: bool, web: bool, check: bool) -> None:
    """Format code. Defaults to all."""
    is_all = not api and not web
    from cli.manager import ProcessManager

    m = ProcessManager()
    if api or is_all:
        m.add_process("black", black(check=check))

    if web or is_all:
        m.add_process("prettier", prettier(check=check))

    m.loop()


@cli.command(help="test services")
@click.option("-a", "--api/--no-api")
@click.option("-w", "--web/--no-web")
def test(api, web):
    """Run tests for service. Defaults to all."""
    raise NotImplementedError()


@cli.command(help="start dev services")
@click.option("-a", "--api/--no-api")
@click.option("-w", "--web/--no-web")
@click.pass_context
def dev(ctx, api, web):
    """Start dev services. Defaults to all."""
    # TODO(chdsbd): How can we capture stdin to support debugging via ipdb?
    setup_django()
    from django.core.management import call_command

    call_command("check", fail_level="WARNING")
    call_command("migrate")
    setup_django_sites()
    from django.core.management import execute_from_command_line

    execute_from_command_line([ctx.command_path, "runserver"])


@cli.command(help="start prod services")
@click.option("-a", "--api/--no-api")
@click.option("-w", "--web/--no-web")
def prod(api, web):
    """Start prod services. Defaults to all."""
    # TODO(chdsbd): How can we capture stdin to support debugging via ipdb?
    raise NotImplementedError()


@cli.command(help="install dependencies/tools")
@click.option("-a", "--api/--no-api")
@click.option("-w", "--web/--no-web")
def install(api: bool, web: bool) -> None:
    """Install tools and dependencies. Defaults to all."""

    is_all = not api and not web
    from cli.manager import ProcessManager

    m = ProcessManager()
    if api or is_all:
        m.add_process("poetry", "poetry install")
    if web or is_all:
        m.add_process("yarn", "yarn install")
    m.loop()


@cli.command(help="update dependencies")
@click.option("--api/--no-api")
@click.option("--web/--no-web")
def update(api, web):
    """Update dependencies. Defaults to all."""
    raise NotImplementedError()


@cli.command(help="build services")
@click.option("--api/--no-api")
@click.option("--web/--no-web")
def build(api, web):
    """Build services for deployment. Defaults to all."""
    raise NotImplementedError()


@cli.command(add_help_option=False, context_settings=dict(ignore_unknown_options=True))
@click.argument("management_args", nargs=-1, type=click.UNPROCESSED)
@click.pass_context
def django(ctx, management_args):
    """run django management commands"""
    setup_django()
    from django.core.management import execute_from_command_line

    execute_from_command_line([ctx.command_path, *management_args])


@cli.command()
@click.pass_context
def missing_migrations(ctx):
    """Check for missing django migrations"""
    setup_django()
    import io
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
def env(shell):
    """print environment"""
    raise NotImplementedError()
