from __future__ import annotations

from typing import TYPE_CHECKING

from django.db import models
from yarl import URL

from recipeyak import config
from recipeyak.models.base import CommonInfo

if TYPE_CHECKING:
    from recipeyak.models import Note, Recipe, User  # noqa: F401


def public_url(key: str) -> str:
    return str(URL(f"https://{config.STORAGE_HOSTNAME}").with_path(key))


class Upload(CommonInfo):
    pk: int
    id: int
    created_by = models.ForeignKey["User"](
        "User", related_name="uploads", null=True, on_delete=models.SET_NULL
    )
    bucket = models.TextField()
    key = models.TextField()
    content_type = models.TextField()
    completed = models.BooleanField(default=False)
    background_url = models.TextField(null=True)
    scraped_by = models.ForeignKey["User"](
        "User", related_name="scrapes", null=True, on_delete=models.SET_NULL
    )
    scraped_by_id: int

    note = models.ForeignKey["Note"](
        "Note", related_name="uploads", null=True, on_delete=models.SET_NULL
    )
    note_id: int | None

    recipe = models.ForeignKey["Recipe"](
        "Recipe", related_name="uploads", null=True, on_delete=models.SET_NULL
    )
    recipe_id: int | None

    profile = models.ForeignKey["User"](
        "User", related_name="+", null=True, on_delete=models.SET_NULL
    )
    profile_id: int | None

    class Meta:
        db_table = "core_upload"

    def public_url(self) -> str:
        return public_url(key=self.key)
