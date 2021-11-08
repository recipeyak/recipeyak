from django.db import models

from django.utils import timezone


class CommonInfo(models.Model):
    """Abstract model for storing common model info"""

    created = models.DateTimeField(default=timezone.now)
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
