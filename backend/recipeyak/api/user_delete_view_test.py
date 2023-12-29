from __future__ import annotations

from typing import Any, cast

import pytest
from django.contrib.auth import get_user_model
from django.test.client import Client

from recipeyak.models import Team, User
from recipeyak.models.membership import Membership

pytestmark = pytest.mark.django_db


def test_user_delete(client: Client, user: User, team: Team) -> None:
    """
    User should only be able to delete their account if they are not a member
    of any team (excluding invites).
    """

    client.force_login(user)

    assert team.is_member(user)
    assert Membership.objects.filter(invite=None, user=user).exists()
    res = client.delete("/api/v1/user/")
    assert res.status_code == 204

    assert not cast(Any, get_user_model()).objects.filter(id=user.id).exists()
