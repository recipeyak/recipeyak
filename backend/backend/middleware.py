import time
from uuid import uuid4

from django.db import connection
from django.conf import settings
from django.http import HttpRequest
import sentry_sdk

from backend.request_state import State

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


class RequestIDMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    @staticmethod
    def generate_request_id():
        return uuid4().hex

    def __call__(self, request: HttpRequest):
        request_id = request.META.get("HTTP_X_REQUEST_ID", self.generate_request_id())

        State.request_id = request_id
        with sentry_sdk.configure_scope() as scope:
            scope.set_tag("request_id", request_id)

        return self.get_response(request)
