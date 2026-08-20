from __future__ import annotations

import os
import sys
from collections.abc import Callable

import sentry_sdk
import structlog
import typer

logger = structlog.stdlib.get_logger()


def run_job(main: Callable[..., None]) -> None:
    """
    Run a job's entrypoint and then exit without interpreter finalization.

    CPython can deadlock while shutting down when a daemon thread -- like
    Sentry's background transport -- is killed part way through a GIL handoff.
    The main thread drops the GIL for the daemon thread, the daemon thread
    notices finalization has started and exits without signaling
    gil->switch_cond, and the main thread waits on that condition forever.

    We hit this in production: backfill_image_placeholders finished its work in
    0.1s, hung on the way out, and because the container never exited its
    systemd timer stayed wedged for a month.

    os._exit() skips finalization entirely, so there is nothing left to
    deadlock on.
    """
    exit_code = 0
    try:
        typer.run(main)
    except SystemExit as e:
        # typer/click raise SystemExit on both success and usage errors.
        exit_code = e.code if isinstance(e.code, int) else int(e.code is not None)
    except BaseException as e:  # - nothing below us can report this
        # We're replacing the interpreter's excepthook, so report by hand.
        sentry_sdk.capture_exception(e)
        logger.exception("job failed")
        exit_code = 1
    sentry_sdk.flush(timeout=5)
    # os._exit() skips flushing buffered output, so do it ourselves.
    sys.stdout.flush()
    sys.stderr.flush()
    os._exit(exit_code)
