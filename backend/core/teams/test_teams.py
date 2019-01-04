import pytest

from django.urls import reverse
from rest_framework import status

from core.models import Team, Membership, Recipe, Invite

pytestmark = pytest.mark.django_db


def test_creating_team(client, user, user2):
    """
    Any authenticated user should be able to create a new team.

    Once created, the user should be an admin of the team
    """
    team_name = "Recipe Yak Team"
    data = {"name": team_name, "emails": [], "level": Membership.CONTRIBUTOR}
    url = reverse("teams-list")

    res = client.post(url, data)
    assert (
        res.status_code == status.HTTP_403_FORBIDDEN
    ), "Unauthenticated users should not be able to create a team"

    client.force_authenticate(user)
    res = client.post(url, data)
    assert (
        res.status_code == status.HTTP_201_CREATED
    ), "Authenticated users should be able to create teams"
    assert res.json().get("name") == data.get("name")
    team_id = res.json().get("id")
    team = Team.objects.get(pk=team_id)

    url = reverse("teams-detail", kwargs={"pk": team_id})
    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK, "user can access newly created team"

    assert res.data == {"id": team_id, "name": team_name}
    assert team.is_admin(user), "Team creator should be an admin"

    client.force_authenticate(user2)
    assert (
        client.get(url).status_code == status.HTTP_404_NOT_FOUND
    ), "user2 cannnot access team since they aren't members"


def test_updating_team_name(client, team, user, user2, user3):
    client.force_authenticate(user)
    data = {"name": "new Recipe Yak Team"}
    url = reverse("teams-detail", kwargs={"pk": team.id})
    res = client.patch(url, data)
    assert res.status_code == status.HTTP_200_OK, "team admin can update team"
    assert res.json().get("name") == data.get("name")

    client.force_authenticate(user2)
    res = client.patch(url, data)
    assert res.status_code == status.HTTP_403_FORBIDDEN, "non-member cannot update team"

    team.force_join(user2, level=Membership.CONTRIBUTOR)
    res = client.patch(url, data)
    assert res.status_code == status.HTTP_403_FORBIDDEN, "non-admin cannot update team"

    # admins of other teams cannot update team they are not an admin of
    client.force_authenticate(user3)
    assert not team.is_admin(user3)
    # create team with user3 as admin
    res = client.post(
        reverse("teams-list"),
        {
            "name": "Cooks 101",
            "emails": [user2.email, user3.email],
            "level": Membership.CONTRIBUTOR,
        },
    )
    assert res.status_code == status.HTTP_201_CREATED
    new_team = Team.objects.get(pk=res.json()["id"])
    assert new_team.is_admin(user3), "Team creator should be admin of team"
    assert not team.is_admin(user3)

    res = client.patch(url, data)
    assert (
        res.status_code == status.HTTP_403_FORBIDDEN
    ), "Admins should not modify teams they do not administer"


def test_deleting_team(client, team, user, user2, empty_team, user3):
    """
    Team admins can delete team only
    """
    url = reverse("teams-detail", kwargs={"pk": team.id})

    # non-member cannot delete team
    client.force_authenticate(user2)
    res = client.delete(url)
    assert res.status_code == status.HTTP_403_FORBIDDEN, "non-member cannot delete team"

    # join user2 to team as non-admin
    team.force_join(user2, level=Membership.CONTRIBUTOR)
    res = client.delete(url)
    assert res.status_code == status.HTTP_403_FORBIDDEN, "non-admin cannot delete team"

    # admins of other teams cannot delete team they are not an admin of
    empty_team.force_join(user3, level=Membership.ADMIN)
    assert not team.is_member(user3)
    assert empty_team.is_admin(user3)
    client.force_authenticate(user3)
    assert (
        client.delete(url).status_code == status.HTTP_403_FORBIDDEN
    ), "admin of another team cannot delete this team"

    client.force_authenticate(user)
    res = client.delete(url)
    assert res.status_code == status.HTTP_204_NO_CONTENT, "team admin can delete team"

    assert (
        client.get(url).status_code == status.HTTP_404_NOT_FOUND
    ), "team should be deleted"


def test_list_team(client, team, user, user2, user3):
    url = reverse("teams-list")
    client.force_authenticate(user2)

    # verify non-members cannot see private teams
    assert not team.is_public, "Team should be private"
    assert not team.is_member(user2), "User should not be team member"
    res = client.get(url)
    assert (
        res.status_code == status.HTTP_200_OK
    ), "all users should be able to list teams"
    assert len(res.json()) == 0, "Non member shouldn't see private team"

    # verify members can see private team
    client.force_authenticate(user)
    assert team.is_member(user), "User should be team member"
    assert not team.is_public, "Team should be private"
    res = client.get(url)
    assert (
        res.status_code == status.HTTP_200_OK
    ), "all users should be able to list teams"
    assert len(res.json()) == 1, "Team member should be able to list private team"
    assert res.json()[0].get("id") == team.id

    # verify non-members can see public teams
    client.force_authenticate(user2)
    team.set_public()
    assert team.is_public, "Team should be public"
    assert not team.is_member(user2), "User should be non-member"
    res = client.get(url)
    assert (
        res.status_code == status.HTTP_200_OK
    ), "all users should be able to list teams"
    assert len(res.json()) == 1, "Non member should see public teams"
    assert res.json()[0].get("id") == team.id

    # verify unauthenticated users cannot view public teams
    assert team.is_public, "Team should be public"
    client.logout()
    res = client.get(url)
    assert (
        res.status_code == status.HTTP_403_FORBIDDEN
    ), "unauthenticated users should not be able to list teams"


def test_retrieve_team(client, team, user, user2):
    url = reverse("teams-detail", kwargs={"pk": team.id})
    client.force_authenticate(user2)

    # verify non-members cannot see private team
    assert not team.is_public, "Team should be private"
    res = client.get(url)
    assert (
        res.status_code == status.HTTP_404_NOT_FOUND
    ), "non-members should not see private team"

    # verify members can see private team
    client.force_authenticate(user)
    assert team.is_member(user), "User should be team member"
    assert not team.is_public, "Team should be private"
    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK, "member should be able to get team"
    assert res.json()["id"] == team.id

    # verify non-members can see public teams
    client.force_authenticate(user2)
    team.set_public()
    assert team.is_public, "Team is public"
    assert not team.is_member(user2), "User should be a non-member"
    res = client.get(url)
    assert (
        res.status_code == status.HTTP_200_OK
    ), "non-members should be able to fetch team"
    assert res.json()["id"] == team.id


def test_create_team_member(client, team, user, user2):
    """
    Adding members shouldn't be accessible via the api.
    We only want to add users by invite
    """
    for u in (user, user2):
        client.force_authenticate(u)
        url = reverse("team-member-list", kwargs={"team_pk": team.id})
        res = client.post(url, {})
        assert res.status_code in (
            status.HTTP_405_METHOD_NOT_ALLOWED,
            status.HTTP_403_FORBIDDEN,
        )


def test_list_team_members(client, team, user, user2, user3):
    """
    Only team members should be able to retrieve team membership information.
    """
    url = reverse("team-member-list", kwargs={"team_pk": team.id})

    # non-members cannot view members
    assert not team.is_member(user2)
    client.force_authenticate(user2)
    assert client.get(url).status_code == status.HTTP_403_FORBIDDEN

    # admins can view members
    client.force_authenticate(user)
    assert team.is_admin(user)
    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK, "Team admins can view members"
    assert len(res.json()) == 1

    # invite user2 to team
    team.invite_user(user2, creator=user)
    # inactive members cannot view members
    client.force_authenticate(user2)
    res = client.get(url)
    assert (
        res.status_code == status.HTTP_403_FORBIDDEN
    ), "Only active users can view members"

    # team viewer can see members
    team.force_join(user3, level=Membership.READ_ONLY)
    client.force_authenticate(user3)
    res = client.get(url)
    assert (
        res.status_code == status.HTTP_200_OK
    ), "Viewer members can retrieve team members"
    assert (
        len(res.json()) == 3
    ), "We have three members (user, user2 [inactive], user3)."


def test_destory_team_member(client, team, user, user2, user3, empty_team):
    user_membership = user.membership_set.get(team=team)
    url = reverse(
        "team-member-detail", kwargs={"team_pk": team.id, "pk": user_membership.id}
    )
    # non-members cannot delete team memberships
    assert not team.is_member(user2)
    client.force_authenticate(user2)
    assert (
        client.delete(url).status_code == status.HTTP_403_FORBIDDEN
    ), "non-member should not be able to delete member"

    # non-admins cannot delete team members
    team.force_join(user3)
    assert not team.is_admin(user3)
    assert team.is_member(user3)
    client.force_authenticate(user3)
    assert (
        client.delete(url).status_code == status.HTTP_403_FORBIDDEN
    ), "non-admin member should not be able to revoke admin user's membership"

    user3_membership = user3.membership_set.get(team=team)
    url = reverse(
        "team-member-detail", kwargs={"team_pk": team.id, "pk": user3_membership.id}
    )
    # admins can remove memberships of members
    client.force_authenticate(user)
    res = client.delete(url)
    assert res.status_code == status.HTTP_204_NO_CONTENT
    assert not Membership.objects.filter(
        id=user3_membership.id
    ).exists(), "admin should be able to remove team membership of member"

    client.force_authenticate(user3)
    assert (
        client.get(url).status_code == status.HTTP_403_FORBIDDEN
    ), "removed user should not be able to access team"

    # admins can remove other admins
    team.force_join_admin(user3)
    assert team.is_admin(user3)
    url = reverse(
        "team-member-detail",
        kwargs={"team_pk": team.id, "pk": user.membership_set.get(team=team).id},
    )
    client.force_authenticate(user3)
    res = client.delete(url)
    assert (
        res.status_code == status.HTTP_204_NO_CONTENT
    ), "Team admins can remove other admins"

    # admins cannot remove members of other teams
    empty_team.force_join(user)
    assert empty_team.is_member(user)
    assert team.is_admin(user3)
    client.force_authenticate(user3)
    url = reverse(
        "team-member-detail",
        kwargs={
            "team_pk": empty_team.id,
            "pk": user.membership_set.get(team=empty_team).id,
        },
    )
    assert (
        client.delete(url).status_code == status.HTTP_403_FORBIDDEN
    ), "Admin users cannot remove member of another team"

    # members can remove their own membership
    empty_team.force_join(user2)
    assert empty_team.is_member(user2) and not empty_team.is_admin(user2)
    client.force_authenticate(user2)
    url = reverse(
        "team-member-detail",
        kwargs={
            "team_pk": empty_team.id,
            "pk": user2.membership_set.get(team=empty_team).id,
        },
    )
    assert client.delete(url).status_code == status.HTTP_204_NO_CONTENT


def test_retrieve_team_member(client, team, user, user2, user3):
    """
    Only team members should be able to retrieve team membership information.
    A member must be an admin to destroy or update a member

    NOTE: This is basically all copied and pasted from test_list_team_members
    """
    user1_membership = user.membership_set.get(team=team)
    url = reverse(
        "team-member-detail", kwargs={"team_pk": team.id, "pk": user1_membership.id}
    )

    # non-members cannot view member
    assert not team.is_member(user2)
    client.force_authenticate(user2)
    assert client.get(url).status_code == status.HTTP_403_FORBIDDEN

    # admins can view member
    client.force_authenticate(user)
    assert team.is_admin(user)
    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK, "Team admins can view members"
    assert res.json()["user"]["id"] == user.id

    # invite user2 to team
    team.invite_user(user2, creator=user)
    # inactive members cannot view member
    client.force_authenticate(user2)
    res = client.get(url)
    assert (
        res.status_code == status.HTTP_403_FORBIDDEN
    ), "Only active users can view members"

    # team viewer can see members
    team.force_join(user3, level=Membership.READ_ONLY)
    client.force_authenticate(user3)
    res = client.get(url)
    assert (
        res.status_code == status.HTTP_200_OK
    ), "Viewer members can retrieve team members"
    assert res.json()["user"]["id"] == user.id


def test_update_team_member(client, team, user, user2, user3, empty_team):
    """
    Only admins should be able to update the membership of team members
    """
    user1_membership = user.membership_set.get(team=team)
    url = reverse(
        "team-member-detail", kwargs={"team_pk": team.id, "pk": user1_membership.id}
    )
    data = {"level": "contributor"}

    # non-members cannot edit member
    assert not team.is_member(user2)
    client.force_authenticate(user2)
    assert client.patch(url, data).status_code == status.HTTP_403_FORBIDDEN

    # members cannot edit member
    team.force_join(user2)
    assert team.is_member(user2) and not team.is_admin(user2)
    assert client.patch(url, data).status_code == status.HTTP_403_FORBIDDEN

    # members cannot edit their membership
    assert team.is_member(user2) and not team.is_admin(user2)
    user2_membership = user2.membership_set.get(team=team)
    url = reverse(
        "team-member-detail", kwargs={"team_pk": team.id, "pk": user2_membership.id}
    )
    assert client.patch(url, data).status_code == status.HTTP_403_FORBIDDEN

    # admins can edit memberships
    client.force_authenticate(user)
    assert team.is_admin(user)
    assert team.is_member(user2)
    assert client.patch(url, data).status_code == status.HTTP_200_OK

    # admins cannot edit memberships on other teams
    empty_team.force_join(user2)
    assert not empty_team.is_member(user) and team.is_admin(user)
    assert empty_team.is_member(user2)
    url = reverse(
        "team-member-detail",
        kwargs={"team_pk": empty_team.id, "pk": user2_membership.id},
    )
    assert client.patch(url, data).status_code == status.HTTP_403_FORBIDDEN


def test_create_team_invite(client, team, user, user2, user3, empty_team):
    """
    TeamAdmins can create team invites
    """
    url = reverse("team-invites-list", kwargs={"team_pk": team.id})
    # team admins can create invites
    client.force_authenticate(user)
    assert team.is_admin(user)
    res = client.post(url, {"emails": [user2.email], "level": Membership.ADMIN})
    assert res.status_code == status.HTTP_201_CREATED
    assert user2.has_invite(team) and not team.is_member(user2)
    assert res.json()[0]["user"]["id"] == user2.id

    for data, description, s in [
        (
            {"emails": [""], "level": "invalid user level"},
            "invalid levels are not valid",
            status.HTTP_400_BAD_REQUEST,
        ),
        (
            {"emails": [user2.id], "level": Membership.ADMIN},
            "invalid users are not valid",
            status.HTTP_400_BAD_REQUEST,
        ),
        (
            {"emails": [user2.email], "level": Membership.CONTRIBUTOR},
            "just filter out emails for invites that already exist",
            status.HTTP_201_CREATED,
        ),
    ]:

        res = client.post(url, data)
        assert res.status_code == s, description


def test_creating_invites_by_non_members(client, team, user2, user3, empty_team):
    # non-admins cannot create invite
    team.force_join(user2, Membership.CONTRIBUTOR)
    assert team.is_member(user2) and not team.is_admin(user2)
    url = reverse("team-invites-list", kwargs={"team_pk": team.id})
    client.force_authenticate(user2)
    res = client.post(url, {"emails": [user3.email]})
    assert res.status_code == status.HTTP_400_BAD_REQUEST

    # non-members cannot create invite
    assert not empty_team.is_member(user3)
    client.force_authenticate(user3)
    url = reverse("team-invites-list", kwargs={"team_pk": empty_team.id})
    res = client.post(url, {"emails": [user2.email]})
    assert res.status_code == status.HTTP_403_FORBIDDEN

    # 404 on non-existent team
    url = reverse("team-invites-list", kwargs={"team_pk": 0})
    res = client.post(url, {"emails": [user2.email]})
    assert res.status_code == status.HTTP_404_NOT_FOUND


def test_destroy_team_invite(client, team, user, user2, user3):
    """
    TeamAdmins owner can destroy team invites
    The recipient of the invite cannot destroy it, they can only decline it
    """

    assert team.is_member(user)
    assert not team.is_member(user2)
    assert not team.is_member(user3)

    invite = team.invite_user(user2, creator=user)

    url = reverse("team-invites-detail", kwargs={"team_pk": team.id, "pk": invite.pk})
    for u, s in [
        (user, status.HTTP_204_NO_CONTENT),
        (user2, status.HTTP_403_FORBIDDEN),
        (user3, status.HTTP_403_FORBIDDEN),
    ]:
        client.force_authenticate(u)
        assert client.delete(url).status_code == s


def test_create_user_invite(client, team, user, user2):
    """
    Create method not allowed. Invite must be created via team endpoint.
    """

    assert team.is_member(user)
    assert not team.is_member(user2)

    url = reverse("user-invites-list")

    for u in [user, user2]:
        client.force_authenticate(u)
        res = client.post(url, {"emails": [u.email], "level": Membership.ADMIN})
        assert res.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


def test_update_user_invite(client, team, user, user2):
    """
    Update/Partial Update not allowed.
    """

    assert team.is_member(user)
    assert not team.is_member(user2)

    invite = team.invite_user(user2, creator=user)

    user_invite_url = reverse("user-invites-detail", kwargs={"pk": invite.pk})
    team_invite_url = reverse(
        "team-invites-detail", kwargs={"team_pk": team.id, "pk": invite.pk}
    )

    for url, users in [
        (
            user_invite_url,
            [
                (user, status.HTTP_405_METHOD_NOT_ALLOWED),
                (user2, status.HTTP_405_METHOD_NOT_ALLOWED),
            ],
        ),
        (
            team_invite_url,
            [
                (user, status.HTTP_405_METHOD_NOT_ALLOWED),
                (user2, status.HTTP_403_FORBIDDEN),
            ],
        ),
    ]:
        for u, s in users:
            client.force_authenticate(u)
            assert client.patch(url, {"membership": 2}).status_code == s


def test_destroy_user_invite(client, team, user, user2):
    """
    User should not be allowed to destroy invite.
    Use detail-decline instead.
    """

    assert team.is_member(user)
    assert not team.is_member(user2)

    invite = team.invite_user(user2, creator=user)

    user_invite_url = reverse("user-invites-detail", kwargs={"pk": invite.id})
    team_invite_url = reverse(
        "team-invites-detail", kwargs={"team_pk": team.id, "pk": invite.id}
    )

    for url, users in [
        (
            user_invite_url,
            [
                (user, status.HTTP_405_METHOD_NOT_ALLOWED),
                (user2, status.HTTP_405_METHOD_NOT_ALLOWED),
            ],
        ),
        (
            team_invite_url,
            [(user, status.HTTP_204_NO_CONTENT), (user2, status.HTTP_403_FORBIDDEN)],
        ),
    ]:
        for u, s in users:
            client.force_authenticate(u)
            assert client.delete(url).status_code == s


def test_list_user_invites(client, team, user, user2):
    """
    User should be allowed to list their invites
    """

    assert team.is_member(user)
    assert not team.is_member(user2)

    invite = team.invite_user(user2, creator=user2)

    url = reverse("user-invites-list")

    client.force_authenticate(user)
    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK
    assert len(res.json()) == 0, "user should not get invite for user2"

    client.force_authenticate(user2)
    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK
    assert res.json()[0].get("id") == invite.id, "user 2 should get their own invite"


def test_retrieve_user_invite(client, team, user, user2):
    """
    User should be allowed to retrieve a specific invite
    """

    assert team.is_member(user)
    assert not team.is_member(user2)

    client.force_authenticate(user)
    url = reverse("team-invites-list", kwargs={"team_pk": team.id})
    res = client.post(url, {"emails": [user2.email], "level": Membership.ADMIN})
    assert res.status_code == status.HTTP_201_CREATED

    pk = res.json()[0].get("id")

    url = reverse("user-invites-detail", kwargs={"pk": pk})
    for u, s in [(user, status.HTTP_404_NOT_FOUND), (user2, status.HTTP_200_OK)]:
        client.force_authenticate(u)
        assert client.get(url).status_code == s


def test_user_invites(client, team, user, user2, user3):
    # invite user2 to team
    client.force_authenticate(user)
    url = reverse("team-invites-list", kwargs={"team_pk": team.id})

    for data in [
        {"level": Membership.ADMIN},
        {"emails": [user2.email]},
        {"emails": [user.email]},
        {},
    ]:
        assert client.post(url, data).status_code == status.HTTP_400_BAD_REQUEST

    res = client.post(url, {"emails": [user2.email], "level": Membership.ADMIN})
    assert res.status_code == status.HTTP_201_CREATED
    invite_pk = res.json()[0]["id"]
    assert user2.membership_set.filter(
        team=team
    ).exists(), "user should be a member of the team"
    assert not user2.membership_set.get(
        team=team
    ).is_active, "user membership should be inactive"
    assert Invite.objects.filter(membership__user=user2).exists(), "user has invite"

    # invite user3 to team
    client.force_authenticate(user)
    url = reverse("team-invites-list", kwargs={"team_pk": team.id})
    res = client.post(url, {"emails": [user3.email], "level": Membership.ADMIN})
    assert res.status_code == status.HTTP_201_CREATED

    # retrieve all invites for user2
    client.force_authenticate(user2)
    url = reverse("user-invites-list")
    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK
    assert len(res.json()) == 1

    # retrieve individual invite for user2
    url = reverse("user-invites-detail", kwargs={"pk": invite_pk})
    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK
    assert res.json()["id"] == invite_pk
    assert res.json()["user"]["id"] == user2.id

    # verify user cannot view team
    url = reverse("team-member-list", kwargs={"team_pk": team.id})
    res = client.get(url)
    assert res.status_code == status.HTTP_403_FORBIDDEN


def test_accept_team_invite(client, team, user, user2, user3):
    """
    User should be able to activate their membership by
    POSTing to detail-accept
    """
    assert team.is_member(user)
    assert not team.is_member(user2)
    # invite user2 to team
    client.force_authenticate(user)
    url = reverse("team-invites-list", kwargs={"team_pk": team.id})
    res = client.post(url, {"emails": [user2.email], "level": Membership.ADMIN})
    assert res.status_code == status.HTTP_201_CREATED
    invite_pk = res.json()[0]["id"]
    assert Invite.objects.get(pk=invite_pk).status == Invite.OPEN

    # accept invite
    client.force_authenticate(user2)
    url = reverse("user-invites-accept", kwargs={"pk": invite_pk})
    res = client.post(url)
    assert res.status_code == status.HTTP_200_OK
    assert Invite.objects.get(pk=invite_pk).status == Invite.ACCEPTED

    # check user can view team
    url = reverse("team-member-list", kwargs={"team_pk": team.id})
    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK


def test_decline_team_invite(client, team, user, user2):
    """
    User should be able to decline their invite by
    POSTing to detail-decline.
    For now this should just delete an invite.
    """
    assert team.is_member(user)
    assert not team.is_member(user2)

    # invite user2 to team
    client.force_authenticate(user)
    url = reverse("team-invites-list", kwargs={"team_pk": team.id})
    res = client.post(url, {"emails": [user2.email], "level": Membership.ADMIN})
    assert res.status_code == status.HTTP_201_CREATED
    invite_pk = res.json()[0]["id"]
    assert Invite.objects.get(pk=invite_pk).status == Invite.OPEN

    # decline invite
    client.force_authenticate(user2)
    url = reverse("user-invites-decline", kwargs={"pk": invite_pk})
    res = client.post(url)
    assert res.status_code == status.HTTP_200_OK
    assert Invite.objects.get(pk=invite_pk).status == Invite.DECLINED

    # check user cannot view team
    url = reverse("team-member-list", kwargs={"team_pk": team.id})
    res = client.get(url)
    assert res.status_code == status.HTTP_403_FORBIDDEN, "Non member cannot view team"


@pytest.mark.parametrize(
    "choice, expected_status",
    [
        (Membership.ADMIN, status.HTTP_201_CREATED),
        (Membership.CONTRIBUTOR, status.HTTP_201_CREATED),
        (Membership.READ_ONLY, status.HTTP_403_FORBIDDEN),
    ],
)
def test_create_team_recipe(choice, expected_status, client, team, user, user2):
    """
    Team member that is not a READ_ONLY user should be able to 'create'
    recipe owned by team.
    """

    team.force_join_admin(user2)

    client.force_authenticate(user)
    url = reverse("team-recipes-list", kwargs={"team_pk": team.id})
    team.force_join(user, level=choice)
    recipe = {
        "name": "Cool new name",
        "ingredients": [
            {"quantity": "1", "unit": "pound", "name": "fish", "description": ""}
        ],
        "steps": [{"text": "place fish in salt"}],
    }
    res = client.post(url, recipe)
    assert res.status_code == expected_status


@pytest.mark.parametrize(
    "choice, expected_status",
    [
        (Membership.ADMIN, status.HTTP_200_OK),
        (Membership.CONTRIBUTOR, status.HTTP_200_OK),
        (Membership.READ_ONLY, status.HTTP_403_FORBIDDEN),
    ],
)
def test_update_team_recipe(choice, expected_status, client, team, user, user2):
    """
    Team member that is not a READ_ONLY user should be able to 'update'
    recipe owned by team.
    """
    team.force_join_admin(user2)

    client.force_authenticate(user)

    recipe = Recipe.objects.create(name="Example Recipe Name", owner=team)
    url = reverse("team-recipes-detail", kwargs={"team_pk": team.id, "pk": recipe.id})
    team.force_join(user, level=choice)
    assert client.patch(url, {"name": "Cool new name"}).status_code == expected_status


@pytest.mark.parametrize(
    "choice, expected_status",
    [
        (Membership.ADMIN, status.HTTP_204_NO_CONTENT),
        (Membership.CONTRIBUTOR, status.HTTP_204_NO_CONTENT),
        (Membership.READ_ONLY, status.HTTP_403_FORBIDDEN),
    ],
)
def test_destroy_team_recipe(choice, expected_status, client, team, user, user2):
    """
    Team member that is not a READ_ONLY user should be able to 'destroy'
    recipe owned by team.
    """
    team.force_join_admin(user2)

    client.force_authenticate(user)

    recipe = Recipe.objects.create(name="Example Recipe Name", owner=team)
    url = reverse("team-recipes-detail", kwargs={"team_pk": team.id, "pk": recipe.id})
    team.force_join(user, level=choice)
    assert client.delete(url).status_code == expected_status


def test_list_team_recipe(client, team, recipe, user, user2):
    """
    Team member should be able to list team recipes.
    For public teams, recipes should be viewable to authenticated users.
    """
    # NOTE: this is copied from the test below

    team.recipes.add(recipe)

    url = reverse("team-recipes-list", kwargs={"team_pk": team.id})

    assert not team.is_member(user2)
    assert not team.is_public

    for u, s in [
        (None, status.HTTP_403_FORBIDDEN),
        (user, status.HTTP_200_OK),
        (user2, status.HTTP_403_FORBIDDEN),
    ]:
        client.force_authenticate(u)
        assert client.get(url).status_code == s

    team.is_public = True
    team.save()
    assert team.is_public

    for u, s in [
        (None, status.HTTP_403_FORBIDDEN),
        (user, status.HTTP_200_OK),
        (user2, status.HTTP_200_OK),
    ]:
        client.force_authenticate(u)
        assert client.get(url).status_code == s


def test_retrieve_team_recipe(client, team, recipe, user, user2):
    """
    Team member should be able to retrieve team recipe.
    For public teams, recipe should be viewable to authenticated users.
    """

    team.recipes.add(recipe)

    url = reverse("team-recipes-detail", kwargs={"team_pk": team.id, "pk": recipe.id})

    assert not team.is_member(user2)
    assert not team.is_public

    for u, s in [
        (None, status.HTTP_403_FORBIDDEN),
        (user, status.HTTP_200_OK),
        (user2, status.HTTP_403_FORBIDDEN),
    ]:
        client.force_authenticate(u)
        assert client.get(url).status_code == s

    team.is_public = True
    team.save()
    assert team.is_public

    for u, s in [
        (None, status.HTTP_403_FORBIDDEN),
        (user, status.HTTP_200_OK),
        (user2, status.HTTP_200_OK),
    ]:
        client.force_authenticate(u)
        assert client.get(url).status_code == s


def test_fetching_team_recipes(client, team_with_recipes, user, user2):
    url = reverse("team-recipes-list", kwargs={"team_pk": team_with_recipes.id})

    client.force_authenticate(user2)
    res = client.get(url)
    assert res.status_code == status.HTTP_403_FORBIDDEN

    client.force_authenticate(user)
    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK


def test_adding_recipe_to_team(client, team, user, user2):
    recipe_url = reverse("team-recipes-list", kwargs={"team_pk": team.id})
    client.force_authenticate(user)
    res = client.get(recipe_url)
    assert res.status_code == status.HTTP_200_OK
    assert len(res.json()) == 0

    recipe = {
        "name": "Recipe name",
        "ingredients": [
            {"quantity": "1", "unit": "pound", "name": "salt", "description": ""}
        ],
        "steps": [{"text": "cover with pepper"}],
    }

    res = client.post(recipe_url, recipe)
    assert res.status_code == status.HTTP_201_CREATED
    recipe_id = res.json().get("id")

    url = reverse("team-recipes-detail", kwargs={"team_pk": team.id, "pk": recipe_id})

    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK

    client.force_authenticate(user2)

    res = client.get(url)
    assert res.status_code == status.HTTP_403_FORBIDDEN


def test_removing_recipe_from_team(client, team_with_recipes, user):
    client.force_authenticate(user)
    url = reverse("team-recipes-list", kwargs={"team_pk": team_with_recipes.id})
    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK
    recipe_id = res.json()[0].get("id")

    url = reverse(
        "team-recipes-detail", kwargs={"team_pk": team_with_recipes.id, "pk": recipe_id}
    )

    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK

    res = client.delete(url)
    assert res.status_code == status.HTTP_204_NO_CONTENT

    assert not Recipe.objects.filter(id=recipe_id).exists()


def test_creating_team_with_name_and_emails(client, user, user2, user3):
    """
    ensure we can create a team with a name, and emails that we want to invite
    """

    client.force_authenticate(user)
    url = reverse("teams-list")
    res = client.post(
        url,
        {
            "name": "Team Name",
            "emails": [user2.email, user3.email],
            "level": Membership.CONTRIBUTOR,
        },
    )
    assert res.status_code == status.HTTP_201_CREATED
    team_id = res.json()["id"]
    team = Team.objects.get(id=team_id)

    assert team.is_admin(user)
    assert team.invite_exists(user2)
    assert team.invite_exists(user3)

    assert team.is_member(user)
    assert not team.is_member(user2)
    assert not team.is_member(user3)


def test_demoting_self_in_team_from_admin(client, team, user):
    """
    prevent a user from demoting themselves if they are the last team member
    """

    assert team.is_member(user)
    assert team.membership_set.count() == 1

    user_membership = user.membership_set.get(team=team)

    url = reverse(
        "team-member-detail", kwargs={"team_pk": team.id, "pk": user_membership.id}
    )

    client.force_authenticate(user)
    res = client.patch(url, {"level": Membership.CONTRIBUTOR})
    assert res.status_code == status.HTTP_400_BAD_REQUEST

    assert team.is_member(user)


def test_deleting_last_membership_of_team(client, team, user):
    assert team.is_member(user)
    assert team.membership_set.count() == 1
    user_membership = user.membership_set.get(team=team)

    url = reverse(
        "team-member-detail", kwargs={"team_pk": team.id, "pk": user_membership.id}
    )

    client.force_authenticate(user)
    res = client.delete(url)
    assert res.status_code == status.HTTP_400_BAD_REQUEST
