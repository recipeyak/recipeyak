import os
import subprocess
from functools import wraps

from .config import setup_django as configure_django
from dotenv import load_dotenv


def setup_django(f):
    @wraps(f)
    def wrapper(*args, **kwds):
        configure_django()
        return f(*args, **kwds)

    return wrapper


def load_env(f):
    """
    source .env files
    """

    @wraps(f)
    def wrapper(*args, **kwds):
        load_dotenv()
        return f(*args, **kwds)

    return wrapper


def docker_machine_unset_env() -> None:
    if os.getenv("DOCKER_MACHINE_NAME"):
        # vars derived from `docker-machin-env`
        for envvar in {
            "DOCKER_CERT_PATH",
            "DOCKER_CERT_PATH",
            "DOCKER_HOST",
            "DOCKER_MACHINE_NAME",
            "DOCKER_MACHINE_NAME",
            "DOCKER_TLS_VERIFY",
        }:
            os.unsetenv(envvar)


def _docker_machine_env() -> None:
    docker_machine_unset_env()
    env = (
        subprocess.check_output(f"docker-machine env {machine_name}", shell=True)
        .decode()
        .split("\n")
    )

    for l in env:
        if l.startswith("export"):
            # export FOO="127.0.0.1" --> ('FOO', '"127.0.0.1"')
            start, end = l.replace("export", "").strip().split("=")
            os.environ[start] = end.strip('"')


def docker_machine_env(f):
    @wraps(f)
    def wrapper(*args, **kwds):
        _docker_machine_env()
        return f(*args, **kwds)

    return wrapper
