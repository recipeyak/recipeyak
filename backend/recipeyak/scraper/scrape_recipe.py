"""
Fetch recipe data from a url and try and avoid SSRF

rel: https://github.com/getsentry/sentry/blob/66b93770e95290a3ab257311e4a2598304fb4e6f/src/sentry/http.py#L57
rel: https://forum.sentry.io/t/source-code-scrapping/4167/7
"""

from __future__ import annotations

import time
from collections.abc import Sequence
from dataclasses import asdict, dataclass
from pathlib import Path
from urllib.parse import urlparse
from uuid import uuid4

from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from recipe_scrapers import scrape_html as parse_html

from recipeyak import config
from recipeyak.models import Scrape
from recipeyak.models.upload import Upload
from recipeyak.models.user import User
from recipeyak.scraper.extract import extract_recipe
from recipeyak.scraper.fetch import fetch_bytes, fetch_content_length
from recipeyak.storage import s3


@dataclass
class IngredientGroup:
    name: str | None
    ingredients: list[str]


@dataclass
class ScrapeResult:
    title: str | None
    total_time: str | None
    yields: str | None
    image: str | None
    upload_id: int | None
    instructions: list[str]
    # the first param of the tuple will be None in the case of a
    ingredient_groups: list[IngredientGroup]
    author: str | None
    canonical_url: str | None
    # db id
    id: int | None = None


def _validate_url(url: str) -> None:
    URLValidator(schemes=["https", "http"])(url)


def _parse_url(url: str | None) -> None | str:
    if url is None:
        return None
    try:
        URLValidator(schemes=["https", "http"])(url)
        return url
    except ValidationError:
        return None


def _get_largest_image(urls: Sequence[str | None]) -> str | None:
    """
    fetch the content-length for all the urls and pick the largest one
    """
    max_size: int | None = None
    max_url: str | None = None
    for url in urls:
        url = _parse_url(url)
        if url is None:
            continue
        content_length = fetch_content_length(url=url)
        if content_length is None:
            continue
        if max_size is None or content_length > max_size:
            max_size = content_length
            max_url = url
    return max_url


@dataclass(frozen=True, slots=True, kw_only=True)
class _FindImageResult:
    upload_id: int | None
    image_url: str | None


def _find_and_save_largest_image(
    *, image_urls: Sequence[str | None], user: User
) -> _FindImageResult:
    image_url = _get_largest_image(image_urls)

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
        s3().put_object(
            Bucket=config.STORAGE_BUCKET_NAME,
            Key=key,
            Body=image_res,
        )
        upload.completed = True
        upload.save()

    return _FindImageResult(
        upload_id=upload.id if upload is not None else None, image_url=image_url
    )


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

    _validate_url(url)
    html, _ = fetch_bytes(url=url)

    parsed = parse_html(html=html, org_url=url)  # type: ignore[arg-type]

    recipe = extract_recipe(parsed)

    image = _find_and_save_largest_image(image_urls=recipe.image_urls, user=user)

    scrape_result = ScrapeResult(
        canonical_url=recipe.canonical_url,
        title=recipe.title,
        total_time=recipe.total_time,
        yields=recipe.yields,
        image=image.image_url,
        ingredient_groups=[
            IngredientGroup(name=x.name, ingredients=x.ingredients)
            for x in recipe.ingredient_groups
        ],
        instructions=recipe.instructions,
        author=recipe.author,
        upload_id=image.upload_id,
    )
    scrape_dict = asdict(scrape_result)
    del scrape_dict["id"]
    duration_sec = time.monotonic() - start
    scrape = Scrape.objects.create(
        html=html.decode(),
        url=url,
        duration_sec=duration_sec,
        parsed=scrape_dict,
    )
    scrape_result.id = scrape.id

    return scrape_result
