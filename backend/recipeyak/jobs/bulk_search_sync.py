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
    res = await pg.fetch(
        """
SELECT
	"id",
	"name",
	"author",
	"source",
	"time",
	"servings",
	"archived_at",
	"tags",
	"team_id",
	(
		SELECT
			count(*) scheduled_count
		FROM
			core_scheduledrecipe
		WHERE
			core_scheduledrecipe.recipe_id = core_recipe.id),
			
			(
			
SELECT
	json_agg(ingredient)
FROM (
	SELECT
		json_build_object('id',id,
			'description', "description",
			'recipe_id', "recipe_id", 
			'quantity', "quantity", 
			'name', "name", 
			'optional', "optional")
			
			
			 ingredient
	FROM
		core_ingredient
	WHERE
		recipe_id = core_recipe.id
	ORDER BY
		position ASC) sub
			) ingredients
	
	FROM
		core_recipe
		where team_id is not null;
"""
    )
    for row in res:
        print(row)


def main() -> None:
    logger.info("initiate")
    sentry_sdk.init(
        send_default_pii=True,
        debug=True,
        traces_sample_rate=1.0,
    )
    config = Config()
    start = time.monotonic()
    with sentry_sdk.monitor(monitor_slug="bulk-search-sync"):
        asyncio.run(job(database_url=config.DATABASE_URL))
    logger.info("done!", total_time_sec=time.monotonic() - start)
    logger.info("exiting")


if __name__ == "__main__":
    typer.run(main)
