from typing import Any

from django.db import models

from core.models.base import CommonInfo
from django.db.models.manager import Manager


class Scrape(CommonInfo):
    id = models.AutoField(primary_key=True)
    html = models.TextField()
    url = models.TextField()
    duration_sec = models.IntegerField()
    parsed = models.JSONField[Any]()

    objects = Manager["Scrape"]()

    class Meta:
        db_table = "scrape"
