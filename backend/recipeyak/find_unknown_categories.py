# ruff: noqa: T201
import asyncio

import asyncpg
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

from recipeyak.category import category

load_dotenv()


class Config(BaseSettings):
    DATABASE_URL: str


async def main() -> None:
    """
    Find unknown categories for shopping list ingredients.
    """
    config = Config()
    find_unknown_categories = """
select
  key
from
  core_shoppinglist s,
  jsonb_each_text((s.ingredients::jsonb ->> 0)::jsonb)
where
  s.created > now() - '6 months'::interval and
  value::jsonb ->> 'category' = 'unknown'
group by 1
order by 1 desc;
"""
    pg = await asyncpg.connect(dsn=config.DATABASE_URL)
    rows = await pg.fetch(find_unknown_categories)
    for ingredient, *_ in rows:
        # check if they are still unknown, because we might have updated the
        # backing data
        if category(ingredient) == "unknown":
            print(ingredient)


if __name__ == "__main__":
    asyncio.run(main())
