import pytest
from django.test.client import Client

from recipeyak.models import Note, Recipe, Team, User

pytestmark = pytest.mark.django_db


def test_updating_other_users_note(
    client: Client, recipe: Recipe, user: User, team: Team, user2: User, user3: User
) -> None:
    """
    Prevent editing notes that other users own
    """
    recipe.team = team
    recipe.owner = team
    recipe.save()

    note = Note.objects.create(text="some note text", created_by=user, recipe=recipe)

    client.force_login(user)
    res = client.patch(f"/api/v1/notes/{note.id}/", {}, content_type="application/json")
    assert res.status_code == 200

    client.force_login(user2)
    res = client.patch(f"/api/v1/notes/{note.id}/", {}, content_type="application/json")
    assert res.status_code == 404

    team.force_join(user3)
    client.force_login(user3)
    res = client.patch(f"/api/v1/notes/{note.id}/", {}, content_type="application/json")
    assert res.status_code == 404
