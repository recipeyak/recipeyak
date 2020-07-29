import os

import pytest
from dotenv import load_dotenv


@pytest.hookimpl(tryfirst=True)
def pytest_load_initial_conftests(args, early_config, parser):
    os.environ["DEBUG"] = "1"
    os.environ.setdefault("DATABASE_URL", "postgres://postgres@127.0.0.1:5432/postgres")
    load_dotenv()
