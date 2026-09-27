import time

import pytest
from django.http import HttpResponse
from django.test.client import Client, RequestFactory

from recipeyak.api.base.middleware import (
    RequestQueueTimingMiddleware,
    ServerTimingMiddleware,
)

pytestmark = pytest.mark.django_db


def test_server_timing_middleware() -> None:
    def get_response(request: object) -> HttpResponse:
        return HttpResponse()

    server_timing_middleware = ServerTimingMiddleware(get_response)

    assert server_timing_middleware("test")["Server-Timing"] is not None  # type: ignore[arg-type]


def test_request_queue_timing_middleware(client: Client) -> None:
    res = client.get("/healthz", HTTP_X_REQUEST_START=f"t={time.time() - 0.5:.3f}")
    timings = dict(
        timing.strip().split(";dur=") for timing in res["Server-Timing"].split(",")
    )
    assert float(timings["queue"]) >= 500
    assert "app" in timings


def test_request_queue_timing_middleware_without_header() -> None:
    middleware = RequestQueueTimingMiddleware(lambda request: HttpResponse())
    request = RequestFactory().get("/")

    assert middleware(request)["Server-Timing"].startswith("app;dur=")


def test_health_check_middleware(client: Client) -> None:
    """
    smoke test for the health check endpoints
    """
    res = client.get("/healthz")
    assert res.status_code == 200
    res = client.get("/readiness")
    assert res.status_code == 200
