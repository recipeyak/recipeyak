from typing import Optional, cast, Any

from django.db import connection
from rest_framework import serializers


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
            # Mypy is correct that we don't have a data property on our parent.
            # We must cast to Any to support the mixin use of this class
            return cast(Any, super()).data
        else:
            with connection.execute_wrapper(blocker):
                return cast(Any, super()).data

    def __init__(self, *args, **kwargs):
        self.dangerously_allow_db = kwargs.pop("dangerously_allow_db", None)
        return cast(Any, super()).__init__(*args, **kwargs)


class BaseModelSerializer(DBBlockerSerializerMixin, serializers.ModelSerializer):
    """
    Serializer with `DBBlockerSerializerMixin` to disable DB access.
    """
    pass
