from logging import getLogger

import pytest
from rest_framework.test import APIClient

from core.models import MyUser, Team

getLogger("flake8").propagate = False


@pytest.fixture
def user():
    """
    Connected to `team`. Has 5 recipes. Member of `team`.
    """
    email = "jperson@example.org"
    return MyUser.objects.create_user(email=email)


@pytest.fixture
def user2():
    email = "james@smith.org"
    return MyUser.objects.create_user(email=email)


@pytest.fixture
def user3():
    email = "john.doe@example.org"
    return MyUser.objects.create_user(email=email)


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def team(user):
    team = Team.objects.create(name="Recipe Yak Team")
    team.force_join_admin(user=user)
    return team
