import pytest
from django.http import HttpResponse
from django.test.client import Client

from recipeyak.api.base.middleware import ServerTimingMiddleware

pytestmark = pytest.mark.django_db


def test_server_timing_middleware() -> None:
    def get_response(request: object) -> HttpResponse:
        return HttpResponse()

    server_timing_middleware = ServerTimingMiddleware(get_response)

    assert server_timing_middleware("test")["Server-Timing"] is not None  # type: ignore


def test_health_check_middleware(client: Client) -> None:
    """
    smoke test for the health check endpoints
    """
    res = client.get("/healthz")
    assert res.status_code == 200
    res = client.get("/readiness")
    assert res.status_code == 200
