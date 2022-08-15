from rest_framework.test import APIClient
from core.models import User, Recipe

from rest_framework import status
import pytest


@pytest.mark.django_db(transaction=True)
def test_reactions(client: APIClient, user: User, recipe: Recipe) -> None:
    client.force_authenticate(user)

    note = recipe.notes.all()[0]
    assert note.reactions.count() == 0

    res = client.post(f"/api/v1/notes/{note.pk}/reactions/", dict(type="❤️"))
    assert res.status_code == status.HTTP_200_OK
    assert res.json()["note_id"] == str(note.pk)
    assert res.json()["user"]["id"] == user.pk
    reaction_id = res.json()["id"]

    res = client.post(f"/api/v1/notes/{note.pk}/reactions/", dict(type="❤️"))
    assert res.status_code == status.HTTP_200_OK
    assert note.reactions.count() == 1, "we should still have one reaction"
    assert note.reactions.filter(id=reaction_id).count() == 1

    res = client.delete(f"/api/v1/reactions/{reaction_id}/")
    assert res.status_code == status.HTTP_204_NO_CONTENT

    assert note.reactions.count() == 0
