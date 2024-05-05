import pytest
from django.test.client import Client

from recipeyak.fixtures import create_recipe, create_team, create_user

pytestmark = pytest.mark.django_db


def test_updating_other_users_note() -> None:
    """
    Ensure we error when sending extra params to the API a la Stripe
    """
    client = Client()
    user = create_user()
    team = create_team(user=user)
    recipe = create_recipe(team=team, user=user)
    client.force_login(user)

    res = client.post(
        f"/api/v1/recipes/{recipe.id}/notes/",
        {
            "text": "great recipe!",
            "param-that-shouldn't-be-allowed": "foo",
            "attachment_upload_ids": [],
        },
        content_type="application/json",
    )
    assert res.status_code == 400
    assert res.json()["error"]["code"] == "validation_error"
    assert res.json()["error"]["message"][0] == {
        "type": "extra_forbidden",
        "loc": ["param-that-shouldn't-be-allowed"],
        "msg": "Extra inputs are not permitted",
    }
