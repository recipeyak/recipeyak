from django.contrib.postgres.fields import JSONField

from core.models.base import CommonInfo


class ShoppingList(CommonInfo):
    """
    Store a shoppinglist anytime we generate one.

    Useful for looking back at bad combines and similar parsing issues.
    """

    ingredients = JSONField()
