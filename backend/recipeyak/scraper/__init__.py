"""
Fetch recipe data from a url and try and avoid SSRF

rel: https://github.com/getsentry/sentry/blob/66b93770e95290a3ab257311e4a2598304fb4e6f/src/sentry/http.py#L57
rel: https://forum.sentry.io/t/source-code-scrapping/4167/7
"""
from __future__ import annotations

import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import cast
from urllib.parse import urlparse
from uuid import uuid4

import extruct
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from recipe_scrapers import scrape_html
from recipe_scrapers._exceptions import SchemaOrgException

from recipeyak import config
from recipeyak.models import Scrape
from recipeyak.models.upload import Upload, s3
from recipeyak.models.user import User
from recipeyak.scraper.fetch import fetch_bytes, fetch_content_length


@dataclass
class ScrapeResult:
    title: str | None
    total_time: str | None
    yields: str | None
    image: str | None
    upload_id: int | None
    ingredients: list[str]
    instructions: list[str]
    author: str | None
    canonical_url: str | None
    # db id
    id: int | None = None


TIME_DURATION_UNITS = (
    ("week", 60 * 60 * 24 * 7),
    ("day", 60 * 60 * 24),
    ("hour", 60 * 60),
    ("min", 60),
    ("sec", 1),
)


def human_time_duration(seconds: int) -> str:
    """
    from: https://gist.github.com/borgstrom/936ca741e885a1438c374824efb038b3
    """
    if seconds == 0:
        return "inf"
    parts = []
    for unit, div in TIME_DURATION_UNITS:
        amount, seconds = divmod(int(seconds), div)
        if amount > 0:
            parts.append("{} {}{}".format(amount, unit, "" if amount == 1 else "s"))
    return ", ".join(parts)


def validate_url(url: str) -> None:
    URLValidator(schemes=["https", "http"])(url)


def parse_url(url: str | None) -> None | str:
    if url is None:
        return None
    try:
        URLValidator(schemes=["https", "http"])(url)
        return url
    except ValidationError:
        return None


def get_open_graph_image(html: bytes) -> str | None:
    og_data = extruct.extract(html, syntaxes=["opengraph"], uniform=True)["opengraph"]
    if not og_data:
        return None
    return cast(str | None, og_data[0].get("og:image"))


def get_largest_image(urls: list[str | None]) -> str | None:
    """
    fetch the content-length for all the urls and pick the largest one
    """
    max_size: int | None = None
    max_url: str | None = None
    for url in urls:
        url = parse_url(url)
        if url is None:
            continue
        content_length = fetch_content_length(url=url)
        if content_length is None:
            continue
        if max_size is None or content_length > max_size:
            max_size = content_length
            max_url = url
    return max_url


def scrape_recipe(*, url: str, user: User) -> ScrapeResult:
    """
    fetch a recipe and avoid:
    - fetching a really large file
    - taking forever to fetch a file
    - hitting an internal IP (aka SSRF)
    """
    if not url.startswith("http"):
        url = "https://" + url
    start = time.monotonic()

    validate_url(url)
    html, _ = fetch_bytes(url=url)

    parsed = scrape_html(html=html, org_url=url)  # type: ignore[arg-type]
    og_image_url = get_open_graph_image(html)

    image_url = get_largest_image([og_image_url, parsed.image()])

    upload: Upload | None = None
    if image_url is not None:
        image_res, content_type = fetch_bytes(url=image_url)
        extension = Path(urlparse(image_url).path).suffix
        key = f"scraper/{uuid4().hex}{extension}"

        upload = Upload(
            scraped_by=user,
            bucket=config.STORAGE_BUCKET_NAME,
            key=key,
            content_type=content_type,
        )
        upload.save()
        # put_object seems simplier than upload_fileobj so going with it
        s3.put_object(
            Bucket=config.STORAGE_BUCKET_NAME,
            Key=key,
            Body=image_res,
        )
        upload.completed = True
        upload.save()

    try:
        total_time = human_time_duration(parsed.total_time() * 60)
    except SchemaOrgException:
        total_time = None

    try:
        yields = parsed.yields()
    except SchemaOrgException:
        yields = None

    try:
        author = parsed.author()
    except AttributeError:
        author = None

    scrape_result = ScrapeResult(
        canonical_url=parsed.canonical_url(),
        title=parsed.title(),
        total_time=total_time,
        yields=yields,
        image=image_url,
        ingredients=parsed.ingredients(),
        instructions=parsed.instructions_list(),
        author=author,
        upload_id=upload.id if upload is not None else None,
    )
    scrape_dict = asdict(scrape_result)
    del scrape_dict["id"]
    scrape = Scrape.objects.create(
        html=html.decode(),
        url=url,
        duration_sec=time.monotonic() - start,
        parsed=scrape_dict,
    )
    scrape_result.id = scrape.id

    return scrape_result
