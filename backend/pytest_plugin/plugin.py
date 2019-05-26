import pytest
from dotenv import load_dotenv
import os

from cli import config


@pytest.hookimpl(tryfirst=True)
def pytest_load_initial_conftests(args, early_config, parser):
    os.environ["DEBUG"] = "1"
    config.set_default()
    load_dotenv()
