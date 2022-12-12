import asyncio
import base64
from io import BytesIO

import asyncpg
import httpx
import sentry_sdk
import structlog
import typer
from dotenv import load_dotenv
from PIL import Image
from yarl import URL

log = structlog.stdlib.get_logger()

load_dotenv()


def get_placeholder_image(image: BytesIO) -> str:
    with Image.open(image) as im:
        # remove transparency which isn't support by jpeg
        if im.mode == "RGBA":
            im = im.convert("RGB")
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


async def job(*, dry_run: bool, pg_dsn: str, storage_hostname: str) -> None:
    log.info("starting up", dry_run=dry_run)
    pg = await asyncpg.connect(dsn=pg_dsn)
    log.info("fetching upload data")
    rows = await pg.fetch(
        """
    select id, key from core_upload
    where completed=true and background_url is null
    limit 50;
    """
    )
    log.info("downloading images")
    async with httpx.AsyncClient(timeout=None) as http:
        results = await asyncio.gather(
            *[
                get_image_data(
                    http,
                    url=public_url(key=key, storage_hostname=storage_hostname),
                    id=upload_id,
                )
                for (upload_id, key) in rows
            ]
        )

    id_to_placeholder: dict[int, str] = {}
    for (upload_id, url, image_bytes) in results:
        log.info("generating placeholder", url=url, upload_id=upload_id)
        id_to_placeholder[upload_id] = get_placeholder_image(BytesIO(image_bytes))

    if dry_run:
        log.info("would update", count=len(id_to_placeholder))
        return

    log.info("updated uploads")
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
    log.info("done!")


def main(
    dry_run: bool = True,
    pg_dsn: str = typer.Argument(..., envvar="DATABASE_URL"),
    storage_hostname: str = typer.Argument(..., envvar="STORAGE_HOSTNAME"),
) -> None:
    log.info("initiate")
    sentry_sdk.init(
        send_default_pii=True,
        traces_sample_rate=1.0,
    )
    asyncio.run(job(dry_run=dry_run, pg_dsn=pg_dsn, storage_hostname=storage_hostname))


if __name__ == "__main__":
    typer.run(main)
