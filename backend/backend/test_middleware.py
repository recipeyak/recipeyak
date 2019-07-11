import pytest
from django.http import HttpResponse
from rest_framework import status
from rest_framework.test import APIClient

from backend.middleware import ServerTimingMiddleware

pytestmark = pytest.mark.django_db


def test_server_timing_middleware():
    def get_response(request):
        return HttpResponse()

    server_timing_middleware = ServerTimingMiddleware(get_response)

    assert server_timing_middleware("test")["Server-Timing"] is not None


def test_health_check_middleware(client: APIClient) -> None:
    """
    smoke test for the health check endpoints
    """
    res = client.get("/healthz")
    assert res.status_code == status.HTTP_200_OK
    res = client.get("/readiness")
    assert res.status_code == status.HTTP_200_OK
