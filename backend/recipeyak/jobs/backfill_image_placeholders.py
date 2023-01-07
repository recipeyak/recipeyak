import asyncio
import base64
import time
from collections.abc import Iterator
from contextlib import contextmanager
from io import BytesIO

import asyncpg
import httpx
import requests
import sentry_sdk
import structlog
import typer
from dotenv import load_dotenv
from PIL import Image, ImageOps
from pillow_heif import register_heif_opener
from pydantic import (
    BaseSettings,
    PostgresDsn,
)
from yarl import URL

logger = structlog.stdlib.get_logger()

load_dotenv()


register_heif_opener()


def get_placeholder_image(image: BytesIO) -> str:
    with Image.open(image) as im:
        # remove transparency which isn't support by jpeg
        if im.mode == "RGBA":
            im = im.convert("RGB")
        # ensure thumbnail is oriented according EXIF orientation.
        im = ImageOps.exif_transpose(im)
        im.thumbnail((42, 42))
        buf = BytesIO()
        im.save(buf, optimize=True, format="jpeg")
        img_str = base64.b64encode(buf.getvalue())
        return (b"data:image/jpg;base64," + img_str).decode()


async def get_image_data(
    http: httpx.AsyncClient, *, url: str, id: int
) -> tuple[int, str, bytes]:
    res = await http.get(url)
    res.raise_for_status()
    return (id, url, res.content)


def public_url(*, key: str, storage_hostname: str) -> str:
    return str(URL(f"https://{storage_hostname}").with_path(key))


async def job(*, dry_run: bool) -> None:
    log = logger.bind(dry_run=dry_run)
    log.info("starting up", dry_run=dry_run)
    pg = await asyncpg.connect(dsn=config.DATABASE_URL)
    log.info("fetching upload data")
    rows = await pg.fetch(
        """
    select id, key from core_upload
    where completed = true
      and background_url is null
      and (note_id is not null or recipe_id is not null)
    limit 50;
    """
    )
    log = log.bind(row_count=len(rows))
    log.info("downloading images")

    async with httpx.AsyncClient(timeout=None) as http:
        results = await asyncio.gather(
            *[
                get_image_data(
                    http,
                    url=public_url(key=key, storage_hostname=config.STORAGE_HOSTNAME),
                    id=upload_id,
                )
                for (upload_id, key) in rows
            ]
        )

    id_to_placeholder: dict[int, str] = {}
    for (upload_id, url, image_bytes) in results:
        log.info("generating placeholder", url=url, upload_id=upload_id)
        id_to_placeholder[upload_id] = get_placeholder_image(BytesIO(image_bytes))

    log = log.bind(placeholder_count=len(id_to_placeholder))

    if dry_run:
        log.info("would update")
        return

    log.info("updating uploads")
    await pg.executemany(
        """
    update core_upload
    set background_url = $2
    where id = $1 and background_url is null
    """,
        [
            (upload_id, background_url)
            for (upload_id, background_url) in id_to_placeholder.items()
        ],
    )


@contextmanager
def monitor_cron(*, monitor_id: str) -> Iterator[None]:
    headers = {"Authorization": f"DSN {config.SENTRY_DSN}"}
    response = requests.post(
        f"https://sentry.io/api/0/monitors/{monitor_id}/checkins/",
        headers=headers,
        json={"status": "in_progress"},
    )
    check_in_id = response.json()["id"]
    status = "ok"
    try:
        yield
    except Exception:  # noqa: BLE001
        status = "error"
    finally:
        response = requests.put(
            f"https://sentry.io/api/0/monitors/{monitor_id}/checkins/{check_in_id}/",
            headers=headers,
            json={"status": status},
        )


class Config(BaseSettings):
    DATABASE_URL: PostgresDsn
    SENTRY_DSN: str
    SENTRY_CRON_MONITOR_ID_BACKFILL_IMAGE_PLACEHOLDER: str
    STORAGE_HOSTNAME: str


config = Config()


def main(dry_run: bool = False) -> None:
    logger.info("initiate")
    sentry_sdk.init(
        send_default_pii=True,
        traces_sample_rate=1.0,
    )
    with monitor_cron(
        monitor_id=config.SENTRY_CRON_MONITOR_ID_BACKFILL_IMAGE_PLACEHOLDER
    ):
        start = time.monotonic()
        asyncio.run(job(dry_run=dry_run))
        logger.info("done!", total_time_sec=time.monotonic() - start)
    logger.info("exiting")


if __name__ == "__main__":
    typer.run(main)
