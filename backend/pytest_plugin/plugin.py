import pytest
import os
from dotenv import load_dotenv

@pytest.hookimpl(tryfirst=True)
def pytest_load_initial_conftests(args, early_config, parser):
    os.environ['DEBUG'] = "1"
    load_dotenv()
