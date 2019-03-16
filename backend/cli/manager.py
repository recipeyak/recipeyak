import sys
from contextlib import contextmanager
from honcho.manager import Manager


class _ProcessManager(Manager):
    def terminate(self):
        pass

    def kill(self):
        pass


@contextmanager
def ProcessManager():
    m = _ProcessManager()
    yield m

    m.loop()

    sys.exit(m.returncode)
