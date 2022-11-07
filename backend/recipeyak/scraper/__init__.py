"""
Fetch recipe data from a url and try and avoid SSRF

rel: https://github.com/getsentry/sentry/blob/66b93770e95290a3ab257311e4a2598304fb4e6f/src/sentry/http.py#L57
rel: https://forum.sentry.io/t/source-code-scrapping/4167/7
"""
from __future__ import annotations

import time
from dataclasses import asdict, dataclass
from io import BytesIO

from django.core.validators import URLValidator
from recipe_scrapers import scrape_html
from typing_extensions import TypedDict
from urllib3.util.retry import Retry
from yarl import URL

from recipeyak.models import Scrape
from recipeyak.scraper.safe_session import SafeSession


class Review(TypedDict):
    author: str
    datePublished: str
    reviewRating: float
    reviewBody: str


@dataclass
class ScrapeResult:
    title: str | None
    total_time: str | None
    yields: str | None
    image: str | None
    ingredients: list[str]
    instructions: list[str]
    author: str | None
    canonical_url: str | None
    # db id
    id: int | None = None


MAX_RES_LENGTH = 40 * 1024 * 1024  # 40MB
TIMEOUT = 5

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


def scrape_recipe(*, url: str) -> ScrapeResult:
    """
    fetch a recipe and avoid:
    - fetching a really large file
    - taking forever to fetch a file
    - hitting an internal IP (aka SSRF)
    """

    if not url.startswith("http"):
        url = "https://" + url

    validate_url(url)

    start = time.monotonic()

    with SafeSession(
        max_retries=Retry(
            total=3, backoff_factor=0.3, status_forcelist=(429, 500, 502, 503, 504)
        )
    ) as http:
        response = http.get(
            url,
            timeout=TIMEOUT,
            allow_redirects=True,
            stream=True,
            headers={
                # naive attempt to look like a browser
                "Host": URL(url).host,
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.5 Safari/605.1.15",
                "Accept-Language": "en-US,en;q=0.9",
                "Connection": "keep-alive",
            },
        )
    response.raise_for_status()

    # via https://stackoverflow.com/a/22347526
    # and https://github.com/getsentry/sentry/blob/66b93770e95290a3ab257311e4a2598304fb4e6f/src/sentry/http.py#L171
    try:
        content_len = int(response.headers["content-length"])
    except (LookupError, ValueError):
        content_len = 0
    if content_len > MAX_RES_LENGTH:
        raise OverflowError
    buf = BytesIO()
    size = 0
    for chunk in response.iter_content(16 * 1024):
        if time.monotonic() - start > TIMEOUT:
            raise TimeoutError
        buf.write(chunk)
        size += len(chunk)
        if size > MAX_RES_LENGTH:
            raise OverflowError

    end = time.monotonic()

    page_data = buf.getvalue()

    r = scrape_html(html=page_data, org_url=url)

    scrape_result = ScrapeResult(
        canonical_url=r.canonical_url(),
        title=r.title(),
        total_time=human_time_duration(r.total_time() * 60),
        yields=r.yields(),
        image=r.image(),
        ingredients=r.ingredients(),
        instructions=r.instructions_list(),
        author=r.author(),
    )
    parsed = asdict(scrape_result)
    del parsed["id"]
    scrape = Scrape.objects.create(
        html=page_data,
        url=url,
        duration_sec=end - start,
        parsed=parsed,
    )
    scrape_result.id = scrape.id

    return scrape_result
