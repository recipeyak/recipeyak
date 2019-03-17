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
