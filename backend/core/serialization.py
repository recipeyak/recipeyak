from typing import Optional

from django.db import connection


def blocker(*args):
    raise Exception("No database access allowed here.")


class DBBlockerSerializerMixin:
    """
    Block database access within serializer

    An escape hatch is available through the `dangerously_allow_db` kwarg.

    NOTE: This mixin should come _before_ the parent serializer. This is
    required for the constructor to remove `dangerously_allow_db` from `kwargs`
    before calling the parent.
    """

    dangerously_allow_db: Optional[bool] = None

    @property
    def data(self):
        if hasattr(self, "initial_data") or self.dangerously_allow_db:
            return super().data
        else:
            with connection.execute_wrapper(blocker):
                return super().data

    def __init__(self, *args, **kwargs):
        self.dangerously_allow_db = kwargs.pop("dangerously_allow_db", None)
        return super().__init__(*args, **kwargs)
