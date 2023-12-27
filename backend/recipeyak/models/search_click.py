from typing import Any

from django.db import models

from recipeyak.models.base import CommonInfo


class SearchClick(CommonInfo):
    id = models.AutoField(primary_key=True)
    content = models.JSONField[Any]()

    class Meta:
        db_table = "search_click"
