import asyncio
import logging
import signal
from typing import Dict, List, Optional, cast

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s: %(message)s", datefmt="%H:%M:%S"
)


def echo(*, name: str, text: str) -> None:
    logging.info("%s: %s", name, text.rstrip())


async def _read_stream(
    stream: Optional[asyncio.streams.StreamReader], name: str
) -> None:
    if stream is None:
        return

    while True:
        line = await stream.readline()
        if not line:
            return
        echo(name=name, text=line.decode())


async def run(*, name: str, command: List[str]) -> int:
    proc = await asyncio.create_subprocess_exec(
        *command, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
    )
    echo(name="system", text=f"started {name} 🚀")

    # via https://kevinmccarthy.org/2016/07/25/streaming-subprocess-stdin-and-stdout-with-asyncio-in-python/
    await asyncio.wait(
        [_read_stream(proc.stdout, name), _read_stream(proc.stderr, name)]
    )

    await proc.wait()

    if proc.returncode == 0:
        echo(name="system", text=f"{name} exit {proc.returncode}")
    else:
        echo(name="system", text=f"{name} exit {proc.returncode} 🚨")

    return proc.returncode


async def shutdown(
    *, signal: signal.Signals, loop: asyncio.events.AbstractEventLoop
) -> None:
    tasks = [t for t in asyncio.all_tasks() if t is not asyncio.current_task()]

    for task in tasks:
        task.cancel()

    await asyncio.gather(*tasks, return_exceptions=True)
    loop.stop()


async def run_lints(*, cmds: Dict[str, List[str]]) -> int:
    res = await asyncio.gather(
        *(run(name=name, command=command) for name, command in cmds.items())
    )

    for r in res:
        if r != 0:
            return cast(int, r)

    return 0


def run_all(*, cmds: Dict[str, List[str]]) -> int:
    loop = asyncio.get_event_loop()

    # signal handling via https://www.roguelynn.com/words/asyncio-graceful-shutdowns/
    signals = (signal.SIGHUP, signal.SIGTERM, signal.SIGINT)

    for s in signals:
        loop.add_signal_handler(
            s, lambda s=s: asyncio.create_task(shutdown(signal=s, loop=loop))
        )

    exit_code = 0
    try:
        exit_code = asyncio.run(run_lints(cmds=cmds))
    finally:
        loop.close()

    return exit_code
