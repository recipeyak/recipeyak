import pytest
from dotenv import load_dotenv

from cli import config


@pytest.hookimpl(tryfirst=True)
def pytest_load_initial_conftests(args, early_config, parser):
    config.set_default()
    load_dotenv()
