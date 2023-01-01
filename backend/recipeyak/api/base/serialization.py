from logging import getLogger
from typing import Any, NoReturn, cast

import pydantic
from django.conf import settings
from django.db import connection
from rest_framework import serializers

log = getLogger(__name__)


class UnexpectedDatabaseAccess(Exception):
    pass


def blocker(*args: object) -> NoReturn:
    raise UnexpectedDatabaseAccess


def warning_blocker(
    execute: Any, sql: Any, params: Any, many: Any, context: Any
) -> Any:
    """
    expected to call `execute` and return the call's result:
    https://docs.djangoproject.com/en/dev/topics/db/instrumentation/#connection-execute-wrapper
    """
    log.warning("Database access in serializer.")
    return execute(sql, params, many, context)


class DBBlockerSerializerMixin:
    """
    Block database access within serializer

    An escape hatch is available through the `dangerously_allow_db` kwarg.

    NOTE: This mixin should come _before_ the parent serializer. This is
    required for the constructor to remove `dangerously_allow_db` from `kwargs`
    before calling the parent.
    """

    def to_representation(self, instance: Any) -> Any:
        if self.dangerously_allow_db:
            return super().to_representation(instance)  # type: ignore [misc]

        if settings.ERROR_ON_SERIALIZER_DB_ACCESS:
            # only raise error when we are in DEBUG mode. We don't want to cause
            # errors in production when we don't need to do so.
            with connection.execute_wrapper(blocker):
                return super().to_representation(instance)  # type: ignore [misc]

        # use a warning blocker elsewhere
        with connection.execute_wrapper(warning_blocker):
            return super().to_representation(instance)  # type: ignore [misc]

    def __init__(self, *args: Any, **kwargs: Any) -> None:
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


class RequestParams(pydantic.BaseModel):
    """
    ValidationErrors raised by subclasses of this model will be converted into
    400 errors.
    """


class StrTrimmed(pydantic.ConstrainedStr):
    strip_whitespace = True
