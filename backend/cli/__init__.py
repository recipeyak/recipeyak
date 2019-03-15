import click


@click.group()
def cli():
    pass


# TODO(chdsbd): Remove frontend/backend differentiators for linting and
# formatting. We should differentiate based on language (Python, Typescript) or
# maybe formatters (Prettier, Black) since Prettier formats multiple languages.


@cli.command(help="lint code")
@click.option("-a", "--api/--no-api")
@click.option("-w", "--web/--no-web")
def lint(api, web):
    """Lint code. Defaults to all."""
    raise NotImplementedError()


@cli.command(help="format code")
@click.option("-a", "--api/--no-api")
@click.option("-w", "--web/--no-web")
def fmt(api, web):
    """Format code. Defaults to all."""
    raise NotImplementedError()


@cli.command(help="test services")
@click.option("-a", "--api/--no-api")
@click.option("-w", "--web/--no-web")
def test(api, web):
    """Run tests for service. Defaults to all."""
    raise NotImplementedError()


@cli.command(help="start dev services")
@click.option("-a", "--api/--no-api")
@click.option("-w", "--web/--no-web")
def dev(api, web):
    """Start dev services. Defaults to all."""
    # TODO(chdsbd): How can we capture stdin to support debugging via ipdb?
    raise NotImplementedError()


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
def install(api, web):
    """Install tools and dependencies. Defaults to all."""
    raise NotImplementedError()


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
    import os
    from dotenv import load_dotenv

    load_dotenv()
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
    from django.core.management import execute_from_command_line

    execute_from_command_line([ctx.command_path, *management_args])


@cli.command()
@click.option("--shell", is_flag=True, help="output env in shell format")
def env(shell):
    """print environment"""
    raise NotImplementedError()
