import asyncio
import json
import random
import time
from typing import Any

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


async def process_queue(connection: asyncpg.Connection[Any], config: Config) -> int:
    async with SearchClient.create(
        app_id=config.ALGOLIA_APPLICATION_ID, api_key=config.ALGOLIA_ADMIN_API_KEY
    ) as client:
        index = client.init_index("recipes")
        async with connection.transaction():
            recipes_to_update = await connection.fetch(
                """
select id, recipe_id
from recipe_index_queue
"""
            )
            res = await connection.fetch(
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
            team_id IS NOT NULL
            and core_recipe.id = ANY($1);
        """,
                [x["recipe_id"] for x in recipes_to_update],
            )
            objects = [json.loads(row["recipe"]) for row in res]
            await index.save_objects_async(objects)
            ids_to_delete = [x["id"] for x in recipes_to_update]
            recipes_to_update = await connection.fetch(
                """
delete from recipe_index_queue where id = ANY($1)
""",
                ids_to_delete,
            )
            return len(ids_to_delete)


async def job(config: Config, single_run: bool) -> None:
    pg = await asyncpg.connect(dsn=config.DATABASE_URL)

    if single_run:
        count = await process_queue(pg, config=config)
        logger.info("processed rows", count=count)
        return

    async def callback(
        conn: asyncpg.Connection[Any],
        pid: int,
        channel: str,
        payload: object,
    ) -> None:
        count = await process_queue(conn, config=config)
        logger.info("processed rows", count=count)

    await pg.add_listener("recipe_enqueued_for_indexing", callback)  # type: ignore[arg-type]

    while True:
        await asyncio.sleep(0.5)
        if random.random() < 0.005:
            logger.info("tick")


def main(single_run: bool = False) -> None:
    logger.info("initiate")
    sentry_sdk.init(
        send_default_pii=True,
        traces_sample_rate=1.0,
    )
    config = Config()
    start = time.monotonic()
    asyncio.run(job(config=config, single_run=single_run))
    logger.info("done!", total_time_sec=time.monotonic() - start)
    logger.info("exiting")


if __name__ == "__main__":
    typer.run(main)
