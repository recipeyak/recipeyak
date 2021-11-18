from typing import Any

from django.db.models import JSONField
from django.db.models.manager import Manager

from core.models.base import CommonInfo


class ShoppingList(CommonInfo):
    """
    Store a shoppinglist anytime we generate one.

    Useful for looking back at bad combines and similar parsing issues.
    """

    ingredients = JSONField[Any]()

    objects = Manager["ShoppingList"]()
