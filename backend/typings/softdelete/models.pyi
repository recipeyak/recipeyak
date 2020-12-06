from datetime import datetime
from typing import Any, Optional, TypeVar

from django.db import models
from django.db.models.base import Model
from django.db.models.query import QuerySet

_T = TypeVar("_T", bound=Model, covariant=True)

class SoftDeleteManager(models.Manager[_T]):
    def undelete(self, using: str = ..., *args: Any, **kwargs: Any) -> None: ...
    def all_with_deleted(self) -> QuerySet[_T]: ...

class SoftDeleteObject(models.Model):
    deleted_at: models.DateTimeField[Optional[datetime]]
    @property
    def deleted(self) -> bool: ...
    def undelete(self, using: str = ..., *args: Any, **kwargs: Any) -> None: ...
