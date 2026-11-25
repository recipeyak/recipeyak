import time
from collections.abc import Iterator
from contextlib import contextmanager
from io import BytesIO

import httpx

from recipeyak.scraper.safe_client import safe_client

MAX_RES_LENGTH = 40 * 1024 * 1024  # 40MB
TIMEOUT = 5
RETRIES = 3
RETRY_STATUSES = frozenset((429, 500, 502, 503, 504))


@contextmanager
def _stream(url: str) -> Iterator[httpx.Response]:
    with safe_client(timeout=TIMEOUT, retries=RETRIES) as http:
        for attempt in range(RETRIES + 1):
            with http.stream(
                "GET",
                url,
                headers={
                    # naive attempt to look like a browser
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.5 Safari/605.1.15",
                    "Accept-Language": "en-US,en;q=0.9",
                },
            ) as response:
                if response.status_code in RETRY_STATUSES and attempt < RETRIES:
                    time.sleep(0.3 * 2**attempt)
                    continue
                response.raise_for_status()
                yield response
                return


def fetch_bytes(*, url: str) -> tuple[bytes, str]:
    start = time.monotonic()
    with _stream(url) as response:
        # via https://stackoverflow.com/a/22347526
        # and https://github.com/getsentry/sentry/blob/66b93770e95290a3ab257311e4a2598304fb4e6f/src/sentry/http.py#L171
        try:
            content_len = int(response.headers["content-length"])
        except LookupError, ValueError:
            content_len = 0
        if content_len > MAX_RES_LENGTH:
            raise OverflowError
        buf = BytesIO()
        size = 0
        for chunk in response.iter_bytes(16 * 1024):
            if time.monotonic() - start > TIMEOUT:
                raise TimeoutError
            buf.write(chunk)
            size += len(chunk)
            if size > MAX_RES_LENGTH:
                raise OverflowError
        return buf.getvalue(), response.headers["content-type"]


def fetch_content_length(*, url: str) -> int | None:
    """
    grab the content-length of the response without downloading the entire file
    """
    with _stream(url) as response:
        # via https://stackoverflow.com/a/22347526
        # and https://github.com/getsentry/sentry/blob/66b93770e95290a3ab257311e4a2598304fb4e6f/src/sentry/http.py#L171
        try:
            size = int(response.headers["content-length"])
            if size > MAX_RES_LENGTH:
                raise OverflowError
            return size
        except LookupError, ValueError:
            return None
