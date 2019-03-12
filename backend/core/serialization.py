from typing import Optional, cast, Any
from logging import getLogger

from django.db import connection
from django.conf import settings
from rest_framework import serializers

log = getLogger(__name__)


def blocker(*args):
    raise Exception("No database access allowed here.")


def warning_blocker(*args):
    log.warning("Database access in serializer.")


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
        if settings.ERROR_ON_SERIALIZER_DB_ACCESS:
            # only raise error when we are in DEBUG mode. We don't want to cause
            # errors in production when we don't need to do so.
            with connection.execute_wrapper(blocker):
                return cast(Any, super()).data

        # use a warning blocker elsewhere
        with connection.execute_wrapper(warning_blocker):
            return cast(Any, super()).data

    def __init__(self, *args, **kwargs) -> None:
        self.dangerously_allow_db = kwargs.pop("dangerously_allow_db", None)
        cast(Any, super()).__init__(*args, **kwargs)


class BaseSerializer(DBBlockerSerializerMixin, serializers.Serializer):
    """
    Serializer with `DBBlockerSerializerMixin` to disable DB access.
    """


class BaseModelSerializer(DBBlockerSerializerMixin, serializers.ModelSerializer):
    """
    Serializer with `DBBlockerSerializerMixin` to disable DB access.
    """


class BaseRelatedField(DBBlockerSerializerMixin, serializers.RelatedField):
    """
    Serializer with `DBBlockerSerializerMixin` to disable DB access.
    """
