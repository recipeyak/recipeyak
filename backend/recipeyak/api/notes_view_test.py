import pytest
from rest_framework import status
from rest_framework.test import APIClient

from recipeyak.models import Note, Recipe, Team, User

pytestmark = pytest.mark.django_db


def test_updating_other_users_note(
    client: APIClient, recipe: Recipe, user: User, team: Team, user2: User, user3: User
) -> None:
    """
    Prevent editing notes that other users own
    """
    recipe.team = team
    recipe.owner = team
    recipe.save()

    note = Note.objects.create(text="some note text", created_by=user, recipe=recipe)

    client.force_authenticate(user)
    res = client.patch(f"/api/v1/notes/{note.id}/")
    assert res.status_code == status.HTTP_200_OK

    client.force_authenticate(user2)
    res = client.patch(f"/api/v1/notes/{note.id}/")
    assert res.status_code == status.HTTP_404_NOT_FOUND

    team.force_join(user3)
    client.force_authenticate(user3)
    res = client.patch(f"/api/v1/notes/{note.id}/")
    assert res.status_code == status.HTTP_404_NOT_FOUND
