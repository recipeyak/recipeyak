import pytest
from dotenv import load_dotenv
import os

from cli import config


@pytest.hookimpl(tryfirst=True)
def pytest_load_initial_conftests(args, early_config, parser):
    config.set_default_testing_variables()
    load_dotenv()
