import asyncio
import json
import time

import asyncpg
import sentry_sdk
import structlog
import typer
from algoliasearch.search_client import SearchClient
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
    ALGOLIA_APPLICATION_ID: str
    ALGOLIA_ADMIN_API_KEY: str


async def job(config: Config) -> None:
    async with SearchClient.create(
        app_id=config.ALGOLIA_APPLICATION_ID, api_key=config.ALGOLIA_ADMIN_API_KEY
    ) as client:
        index = client.init_index("recipes")
        pg = await asyncpg.connect(dsn=config.DATABASE_URL)
        res = await pg.fetch(
            """
    SELECT
        json_build_object(
            'objectID', id,
            'id', id,
            'name', name,
            'author', author,
            'source', source,
            'time', time,
            'servings', servings,
            'archived', archived_at is distinct from null,
            'archived_at', archived_at,
            'tags', tags,
            'team_id', team_id,
            'primary_image_url', (
                select 'https://images-cdn.recipeyak.com/' || key from core_upload
                where core_upload.id = core_recipe.primary_image_id
            ),
            'scheduled_count', (
                SELECT
                    count(*)
                FROM
                    core_scheduledrecipe
                WHERE
                    core_scheduledrecipe.recipe_id = core_recipe.id
            ),
            'ingredients', (
                SELECT
                    json_agg(ingredient)
                FROM (
                    SELECT
                        json_build_object(
                            'id', id,
                            'description', "description",
                            'quantity_name', "quantity" || ' ' || "name",
                            'quantity_name_description', "quantity" || ' ' || "name" || ', ' || "description",
                            'recipe_id', "recipe_id",
                            'quantity', "quantity",
                            'name', "name",
                            'optional', "optional"
                        ) AS ingredient
                    FROM
                        core_ingredient
                    WHERE
                        recipe_id = core_recipe.id
                    ORDER BY
                        position ASC
                ) sub
            )
        ) recipe
    FROM
        core_recipe
    WHERE
        team_id IS NOT NULL;
    """
        )
        objects = [json.loads(row["recipe"]) for row in res]
        await index.save_objects_async(objects)


def main() -> None:
    logger.info("initiate")
    sentry_sdk.init(
        send_default_pii=True,
        traces_sample_rate=1.0,
    )
    config = Config()
    start = time.monotonic()
    with sentry_sdk.monitor(monitor_slug="bulk-search-sync"):
        asyncio.run(job(config=config))
    logger.info("done!", total_time_sec=time.monotonic() - start)
    logger.info("exiting")


if __name__ == "__main__":
    typer.run(main)
