from logging import getLogger
from typing import Any, cast

from django.conf import settings
from django.db import connection
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

    def to_representation(self, instance):
        if self.dangerously_allow_db:
            return cast(Any, super()).to_representation(instance)

        if settings.ERROR_ON_SERIALIZER_DB_ACCESS:
            # only raise error when we are in DEBUG mode. We don't want to cause
            # errors in production when we don't need to do so.
            with connection.execute_wrapper(blocker):
                return cast(Any, super()).to_representation(instance)

        # use a warning blocker elsewhere
        with connection.execute_wrapper(warning_blocker):
            return cast(Any, super()).to_representation(instance)

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
