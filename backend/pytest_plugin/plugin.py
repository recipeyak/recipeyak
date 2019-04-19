import pytest
from cli import config
from dotenv import load_dotenv


@pytest.hookimpl(tryfirst=True)
def pytest_load_initial_conftests(args, early_config, parser):
    config.set_default()
    load_dotenv()
