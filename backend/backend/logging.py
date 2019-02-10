from django.conf import settings


class TestingDisableFilter:
    """
    Disable logging if the TESTING environment variable is set.
    """

    def filter(self, record):
        return not settings.TESTING
