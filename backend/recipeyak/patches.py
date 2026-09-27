from __future__ import annotations

from django.db.models.fields import Field


def patch_django() -> None:
    """
    Django types Field as generic, but doesn't support subscripting it at
    runtime. QuerySet and BaseManager have supported this since Django 4.1.
    """
    Field.__class_getitem__ = classmethod(  # type: ignore[attr-defined]
        lambda cls, *args, **kwargs: cls
    )
