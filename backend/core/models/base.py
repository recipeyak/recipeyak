from django.db import models


class CommonInfo(models.Model):
    """Abstract model for storing common model info"""

    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
