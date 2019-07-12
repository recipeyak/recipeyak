import enum
import logging
import time
from uuid import uuid4

import sentry_sdk
from django.conf import settings
from django.db import connection
from django.http import HttpRequest, HttpResponse, HttpResponseServerError

from backend.request_state import State

log = logging.getLogger(__name__)


MSEC_CONVERT_FACTOR = 1000


class NoCacheMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response["Cache-Control"] = "no-store, no-cache, must-revalidate"
        response["Pragma"] = "no-cache"
        response["Expires"] = "0"
        return response


def total_query_time():
    return (
        sum(float(query["time"]) for query in connection.queries) * MSEC_CONVERT_FACTOR
    )


class ServerTimingMiddleware:
    """
    follow Serving Timing spec
    see: https://w3c.github.io/server-timing/#the-server-timing-header-field
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.perf_counter()

        response = self.get_response(request)

        database_time = total_query_time()

        end = time.perf_counter()
        elapsed_time = (end - start) * MSEC_CONVERT_FACTOR

        response["Server-Timing"] = (
            f'db;desc="Database";dur={database_time},'
            f'non-db;desc="View Time";dur={elapsed_time - database_time},'
            f'total;desc="Total Response Time";dur={elapsed_time},'
        )
        return response


class XForwardedForMiddleware:
    """
    Point REMOTE_ADDR to X-Forwarded-For so django-user-session logs the correct IP.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if "HTTP_X_FORWARDED_FOR" in request.META:
            request.META["REMOTE_ADDR"] = (
                request.META["HTTP_X_FORWARDED_FOR"].split(",")[0].strip()
            )
        return self.get_response(request)


class APIDelayMiddleware:
    """
    Add artificial delay to request. Useful for development.
    """

    def __init__(self, get_response):
        self.get_response = get_response
        self.API_DELAY_MS = getattr(settings, "API_DELAY_MS", 200)

    def __call__(self, request):
        time.sleep(self.API_DELAY_MS / 1000)
        return self.get_response(request)


class CurrentRequestMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    @staticmethod
    def generate_request_id():
        return uuid4().hex

    def __call__(self, request: HttpRequest):
        request_id = request.META.get("HTTP_X_REQUEST_ID")
        if request_id is None:
            request_id = self.generate_request_id()

        State.request_id = request_id
        State.request = request
        with sentry_sdk.configure_scope() as scope:
            scope.set_tag("request_id", request_id)

        return self.get_response(request)


@enum.unique
class ReadinessError(enum.IntEnum):
    PG_BAD_RESPONSE = 1
    PG_CANNOT_CONNECT = 2


class HealthCheckMiddleware:
    """
    from: https://www.ianlewis.org/en/kubernetes-health-checks-django
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request: HttpRequest):
        if request.method == "GET":
            if request.path == "/readiness":
                return self.readiness(request)
            if request.path == "/healthz":
                return self.healthz(request)
        return self.get_response(request)

    def healthz(self, request: HttpRequest) -> HttpResponse:
        """
        Note: we don't check the database here because if the database
        connection failed then this service would restart, not the database.
        """
        return HttpResponse("OK")

    def readiness(self, request: HttpRequest) -> HttpResponse:
        """
        Connect to each database and do a generic standard SQL query
        that doesn't write any data and doesn't depend on any tables
        being present.
        """
        try:
            from django.db import connections

            for name in connections:
                cursor = connections[name].cursor()
                cursor.execute("SELECT 1;")
                row = cursor.fetchone()
                if row is None:
                    return HttpResponseServerError(ReadinessError.PG_BAD_RESPONSE)
        except Exception:  # pylint: disable=broad-except
            log.exception("could not connect to postgres")
            return HttpResponseServerError(ReadinessError.PG_CANNOT_CONNECT)

        return HttpResponse("OK")
