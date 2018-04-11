import pytest
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status

pytestmark = pytest.mark.django_db


def test_user_delete(client, user, team):
    """
    User should only be able to delete their account if they are not a member
    of any team (excluding invites).
    """

    client.force_authenticate(user)
    url = reverse('rest_user_details')
    assert team.is_member(user)
    assert user.has_team()

    # user must leave team before deleting account
    res = client.delete(url)
    assert res.status_code == status.HTTP_403_FORBIDDEN
    assert res.json()['detail'] is not None

    # leave team
    team.delete()
    assert not user.has_team()

    # user can delete account once they have left their teams
    res = client.delete(url)
    assert res.status_code == status.HTTP_204_NO_CONTENT

    assert not get_user_model().objects.filter(id=user.id).exists()
