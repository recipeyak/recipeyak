from functools import wraps

from .config import setup_django as configure_django

def setup_django(f):
    @wraps(f)
    def wrapper(*args, **kwds):
        configure_django()
        return f(*args, **kwds)
    return wrapper
