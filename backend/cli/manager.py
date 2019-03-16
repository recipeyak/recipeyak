from contextlib import contextmanager
from honcho.manager import Manager

import datetime
import signal
import sys

from honcho.compat import Empty

KILL_WAIT = 5
SIGNALS = {
    signal.SIGINT: {"name": "SIGINT", "rc": 130},
    signal.SIGTERM: {"name": "SIGTERM", "rc": 143},
}
SYSTEM_PRINTER_NAME = "system"


class _ProcessManager(Manager):
    """
    Modified version of the honcho Manager to only kill programs when the user
    sends SIGINT/SIGKILL. If a process exits with a non-zero status code, we
    carry on because we want all lints to run through before returning a bad
    status code.
    """

    exit_start = None

    def terminate(self):
        """
        Terminate all processes managed by this ProcessManager.

        Modified with `exit_start` for triggering `_killall(force=True)` after
        some time.
        """
        if self.exit_start:
            return
        self.exit_start = self._env.now()
        self._killall()

    def loop(self):
        """
        Start all the added processes and multiplex their output onto the bound
        printer (which by default will print to STDOUT).

        If one process terminates, all the others will be terminated by
        Honcho, and :func:`~honcho.manager.Manager.loop` will return.

        This method will block until all the processes have terminated.

        Modified as described in docstring for overall class
        """

        def _terminate(signum, frame):
            self._system_print("%s received\n" % SIGNALS[signum]["name"])
            self.returncode = SIGNALS[signum]["rc"]
            if signum == signal.SIGTERM:
                self.kill()
            if signum == signal.SIGINT:
                self.terminate()

        signal.signal(signal.SIGTERM, _terminate)
        signal.signal(signal.SIGINT, _terminate)

        self._start()

        exit = False  # pylint: disable=W0622

        while 1:
            try:
                msg = self.events.get(timeout=0.1)
            except Empty:
                if exit:
                    break
            else:
                if msg.type == "line":
                    self._printer.write(msg)
                elif msg.type == "start":
                    self._processes[msg.name]["pid"] = msg.data["pid"]
                    self._system_print(
                        "%s started (pid=%s)\n" % (msg.name, msg.data["pid"])
                    )
                elif msg.type == "stop":
                    self._processes[msg.name]["returncode"] = msg.data["returncode"]
                    self._system_print(
                        "%s stopped (rc=%s)\n" % (msg.name, msg.data["returncode"])
                    )
                    # set a non-zero return code if we have a failure of any process
                    if msg.data["returncode"] > 0:
                        self.returncode = 1

            if self._all_started() and self._all_stopped():
                exit = True

            if self.exit_start is not None:
                # If we've been in this loop for more than KILL_WAIT seconds,
                # it's time to kill all remaining children.
                waiting = self._env.now() - self.exit_start
                if waiting > datetime.timedelta(seconds=KILL_WAIT):
                    self.kill()


@contextmanager
def ProcessManager():
    m = _ProcessManager()
    yield m

    m.loop()

    sys.exit(m.returncode)


@contextmanager
def DefaultManager():
    """Context manager for default honcho manager"""
    m = Manager()
    yield m
    m.loop()
    sys.exit(m.returncode)
