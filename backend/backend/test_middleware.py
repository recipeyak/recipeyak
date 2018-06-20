import pytest
from django.http import HttpResponse
from backend.middleware import ServerTimingMiddleware

pytestmark = pytest.mark.django_db


def test_server_timing_middleware():
    def get_response(request):
        return HttpResponse()
    server_timing_middleware = ServerTimingMiddleware(get_response)

    assert server_timing_middleware("test")['Server-Timing'] is not None
