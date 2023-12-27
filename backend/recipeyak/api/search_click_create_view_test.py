from __future__ import annotations

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from recipeyak.models import User

pytestmark = pytest.mark.django_db


def test_updating_edit_recipe_via_api_empty_tags(client: APIClient, user: User) -> None:
    """
    regression test to allow empty lists for tags
    """
    client.force_authenticate(user)

    res = client.post(
        "/api/v1/search-click/",
        {
            "matches": [{"kind": "name", "value": "Plain Pizza Pie"}],
            "query": "pizz",
            "recipe": {
                "id": 83,
                "name": "Plain Pizza Pie",
                "scheduledCount": 2,
                "author": "Sam Sifton",
                "tags": ["entree"],
                "ingredients": [
                    {"id": 828, "quantity": "some", "name": "grated parmesan"},
                    {"id": 829, "quantity": "some", "name": "ground black pepper"},
                    {"id": 830, "quantity": "some", "name": "kosher salt"},
                    {"id": 832, "quantity": "some", "name": "basil leaves"},
                    {"id": 833, "quantity": "1", "name": "bag assorted cheese"},
                    {"id": 834, "quantity": "1", "name": "ball pizza dough"},
                    {
                        "id": 835,
                        "quantity": "1",
                        "name": "28 ounce can San Marzano tomatoes",
                    },
                ],
                "archived_at": None,
            },
        },
    )
    assert res.status_code == status.HTTP_200_OK
