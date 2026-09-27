from __future__ import annotations

from typing import TYPE_CHECKING
from urllib.parse import quote

from django.db import models

from recipeyak import config
from recipeyak.models.base import CommonInfo

if TYPE_CHECKING:
    from recipeyak.models import Note, Recipe, User  # noqa: F401


# characters that are left unescaped in a URL path
_PATH_SAFE_CHARS = "/!$&'()*+,;=:@~"


def public_url(key: str) -> str:
    # Equivalent to `yarl.URL(...).with_path(key)` but ~15x faster, which adds
    # up when serializing lists of recipes.
    if not key:
        return f"https://{config.STORAGE_HOSTNAME}"
    path = key if key.startswith("/") else "/" + key
    return f"https://{config.STORAGE_HOSTNAME}{quote(path, safe=_PATH_SAFE_CHARS)}"


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
