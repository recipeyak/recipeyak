import time
from io import BytesIO

from urllib3.util.retry import Retry
from yarl import URL

from recipeyak.scraper.safe_session import SafeSession

MAX_RES_LENGTH = 40 * 1024 * 1024  # 40MB
TIMEOUT = 5


def fetch_bytes(*, url: str) -> bytes:
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
    return buf.getvalue()


def fetch_content_length(*, url: str) -> int | None:
    """
    grab the content-length of the response without downloading the entire file
    """
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
        size = int(response.headers["content-length"])
        if size > MAX_RES_LENGTH:
            raise OverflowError
        return size
    except (LookupError, ValueError):
        return None
