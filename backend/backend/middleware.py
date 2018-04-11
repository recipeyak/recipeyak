import time

from django.db import connection

MSEC_CONVERT_FACTOR = 1000


class NoCacheMiddleware:

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response['Cache-Control'] = 'no-store, no-cache, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response


def total_query_time():
    return sum(float(query['time'])
               for query in connection.queries) * MSEC_CONVERT_FACTOR


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

        response['Server-Timing'] = (
            f'db;desc="Database";dur={database_time},'
            f'non-db;desc="View Time";dur={elapsed_time - database_time},'
            f'total;desc="Total Response Time";dur={elapsed_time},'
        )
        return response
