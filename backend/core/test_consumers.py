from typing import List, Tuple

import pytest
from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from channels.testing import WebsocketCommunicator
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from backend.routing import application
from core.models import MyUser, Team


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_consumer_without_auth() -> None:
    """
    when the user doesn't have authentication, we should just close the
    connection
    """
    path = "/ws/"
    comm = WebsocketCommunicator(application, path)
    connected, _subprotocol = await comm.connect()
    assert connected is False
    await comm.disconnect()


def get_headers_for_user(
    *, client: APIClient, user: MyUser
) -> List[Tuple[bytes, bytes]]:
    password = "example password"
    user.set_password(password)
    user.save()
    client.login(username=user.email, password=password)
    assert user.is_authenticated
    return [
        (b"origin", b"localhost"),
        (b"cookie", client.cookies.output(header="", sep="; ").encode()),
    ]


# Note: we need to add transaction in order to get the database to work
# see: https://github.com/django/channels/issues/1091
@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_pub_sub_consumer(
    client: APIClient, user: MyUser, team: Team, user2: MyUser, user3: MyUser
) -> None:
    """
    ensure that we broadcast schedule-presence events correctly
    """
    path = "/ws/"

    communicator_one = WebsocketCommunicator(
        application, path, headers=get_headers_for_user(client=client, user=user)
    )
    connected, _subprotocol = await communicator_one.connect()
    assert connected

    communicator_two = WebsocketCommunicator(
        application, path, headers=get_headers_for_user(client=client, user=user2)
    )
    connected, _subprotocol = await communicator_two.connect()
    assert connected

    communicator_three = WebsocketCommunicator(
        application, path, headers=get_headers_for_user(client=client, user=user3)
    )
    connected, _subprotocol = await communicator_three.connect()
    assert connected

    @database_sync_to_async
    def check_team_membership() -> None:
        assert team.is_member(user)
        assert team.force_join(user2)
        assert team.is_member(user2)
        assert not team.is_member(user3), (
            "ensure we have a user which isn't part of the team. "
            "This allows us to test that we broadcast to only allowed subscribers"
        )

    await check_team_membership()

    # 1. sub to events for a specific schedule (team)
    subscribe_msg = {
        "type": "subscribe",
        "data": {"event": "schedule_presence", "team_id": team.id},
    }
    await communicator_one.send_json_to(subscribe_msg)
    await communicator_two.send_json_to(subscribe_msg)
    # we connect, but we aren't part
    await communicator_three.send_json_to(subscribe_msg)

    # 2. POST to user presence endpoint
    url = reverse("calendar-presence", kwargs={"team_pk": team.id})

    client.force_authenticate(user)
    res = await sync_to_async(client.post)(url)
    assert res.status_code == status.HTTP_200_OK

    # 3. assert we get an update through the websocket
    expected_response = {
        "type": "publish",
        "data": {
            "event": "schedule_presence",
            "team_id": team.id,
            "user": {"id": user.id, "avatarURL": user.avatar_url, "email": user.email},
        },
    }
    assert (
        await communicator_one.receive_json_from() == expected_response
    ), "we should have received the update for the current user that matched"
    assert await communicator_two.receive_json_from() == expected_response
    assert await communicator_three.receive_nothing() is True, (
        "user3 isn't permed to sub to schedule events for the "
        "given team so they shouldn't recieve anything"
    )

    await communicator_one.disconnect()
    await communicator_two.disconnect()
    await communicator_three.disconnect()
