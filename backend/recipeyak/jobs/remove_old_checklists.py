import asyncio
import time

import asyncpg
import sentry_sdk
import structlog
import typer
from dotenv import load_dotenv
from pydantic import (
    BaseSettings,
    PostgresDsn,
)

logger = structlog.stdlib.get_logger()

load_dotenv()


class Config(BaseSettings):
    DATABASE_URL: PostgresDsn
    SENTRY_DSN: str


async def job(database_url: str) -> None:
    pg = await asyncpg.connect(dsn=database_url)
    res = await pg.execute(
        """
delete from recipe_cook_checklist_check
where recipe_id in (
    select recipe_id
    from recipe_cook_checklist_check
    group by recipe_id
    having max(modified) < now() - '24 hours'::interval
    limit 10
);
"""
    )
    logger.info("deleted", response=res)


def main() -> None:
    logger.info("initiate")
    sentry_sdk.init(
        send_default_pii=True,
        debug=True,
        traces_sample_rate=1.0,
    )
    config = Config()
    start = time.monotonic()
    with sentry_sdk.monitor(monitor_slug="remove-old-cook-checklists"):
        asyncio.run(job(database_url=config.DATABASE_URL))
    logger.info("done!", total_time_sec=time.monotonic() - start)
    logger.info("exiting")


if __name__ == "__main__":
    typer.run(main)
