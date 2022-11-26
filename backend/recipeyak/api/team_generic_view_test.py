import pytest
from rest_framework import status
from rest_framework.test import APIClient

from recipeyak.models import Invite, Membership, Team, User

pytestmark = pytest.mark.django_db


def test_creating_team(client: APIClient, user: User, user2: User) -> None:
    """
    Any authenticated user should be able to create a new team.

    Once created, the user should be an admin of the team
    """
    team_name = "Recipe Yak Team"
    data = {"name": team_name, "emails": [], "level": Membership.CONTRIBUTOR}
    url = "/api/v1/t/"

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

    url = f"/api/v1/t/{team.pk}/"
    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK, "user can access newly created team"

    assert res.data == {"id": team_id, "name": team_name}
    assert team.is_admin(user), "Team creator should be an admin"

    client.force_authenticate(user2)
    assert (
        client.get(url).status_code == status.HTTP_404_NOT_FOUND
    ), "user2 cannnot access team since they aren't members"


def test_updating_team_name(
    client: APIClient, team: Team, user: User, user2: User, user3: User
) -> None:
    client.force_authenticate(user)
    team.force_join_admin(user=user)
    data = {"name": "new Recipe Yak Team"}
    url = f"/api/v1/t/{team.pk}/"
    res = client.patch(url, data)
    assert res.status_code == status.HTTP_200_OK, "team admin can update team"
    assert res.json().get("name") == data.get("name")

    client.force_authenticate(user2)
    res = client.patch(url, data)
    assert res.status_code == 404

    team.force_join(user2, level=Membership.CONTRIBUTOR)
    res = client.patch(url, data)
    assert res.status_code == status.HTTP_403_FORBIDDEN, "non-admin cannot update team"

    # admins of other teams cannot update team they are not an admin of
    client.force_authenticate(user3)
    assert not team.is_admin(user3)
    # create team with user3 as admin
    res = client.post(
        "/api/v1/t/",
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
        res.status_code == 404
    ), "Admins should not modify teams they do not administer"


def test_deleting_team(
    client: APIClient,
    team: Team,
    user: User,
    user2: User,
    empty_team: Team,
    user3: User,
) -> None:
    """
    Team admins can delete team only
    """
    url = f"/api/v1/t/{team.pk}/"

    # non-member cannot delete team
    client.force_authenticate(user2)
    res = client.delete(url)
    assert res.status_code == status.HTTP_404_NOT_FOUND, "non-member cannot delete team"

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
        client.delete(url).status_code == status.HTTP_404_NOT_FOUND
    ), "admin of another team cannot delete this team"

    client.force_authenticate(user)
    res = client.delete(url)
    assert res.status_code == status.HTTP_204_NO_CONTENT, "team admin can delete team"

    assert (
        client.get(url).status_code == status.HTTP_404_NOT_FOUND
    ), "team should be deleted"


def test_list_team(
    client: APIClient, team: Team, user: User, user2: User, user3: User
) -> None:
    url = "/api/v1/t/"
    client.force_authenticate(user2)

    # verify non-members cannot see private teams
    assert not team.is_public, "Team should be private"
    assert not team.is_member(user2), "User should not be team member"
    res = client.get(url)
    assert (
        res.status_code == status.HTTP_200_OK
    ), "all users should be able to list teams"
    assert not res.json(), "Non member shouldn't see private team"

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


def test_retrieve_team(client: APIClient, team: Team, user: User, user2: User) -> None:
    url = f"/api/v1/t/{team.pk}/"
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


def test_create_team_member(
    client: APIClient, team: Team, user: User, user2: User
) -> None:
    """
    Adding members shouldn't be accessible via the api.
    We only want to add users by invite
    """
    for u in (user, user2):
        client.force_authenticate(u)
        url = f"/api/v1/t/{team.id}/members/"
        res = client.post(url, {})
        assert res.status_code in (
            status.HTTP_405_METHOD_NOT_ALLOWED,
            status.HTTP_403_FORBIDDEN,
        )


def test_list_team_members(
    client: APIClient, team: Team, user: User, user2: User, user3: User
) -> None:
    """
    Only team members should be able to retrieve team membership information.
    """
    url = f"/api/v1/t/{team.id}/members/"

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


def test_destory_team_member(
    client: APIClient,
    team: Team,
    user: User,
    user2: User,
    user3: User,
    empty_team: Team,
) -> None:
    user_membership = user.membership_set.get(team=team)
    # non-members cannot delete team memberships
    assert not team.is_member(user2)
    client.force_authenticate(user2)
    assert (
        client.delete(f"/api/v1/t/{team.pk}/members/{user_membership.id}/").status_code
        == status.HTTP_403_FORBIDDEN
    ), "non-member should not be able to delete member"

    # non-admins cannot delete team members
    team.force_join(user3)
    assert not team.is_admin(user3)
    assert team.is_member(user3)
    client.force_authenticate(user3)
    assert (
        client.delete(f"/api/v1/t/{team.pk}/members/{user_membership.id}/").status_code
        == status.HTTP_403_FORBIDDEN
    ), "non-admin member should not be able to revoke admin user's membership"

    user3_membership = user3.membership_set.get(team=team)
    # admins can remove memberships of members
    client.force_authenticate(user)
    res = client.delete(f"/api/v1/t/{team.pk}/members/{user3_membership.id}/")
    assert res.status_code == status.HTTP_204_NO_CONTENT
    assert not Membership.objects.filter(
        id=user3_membership.id
    ).exists(), "admin should be able to remove team membership of member"

    client.force_authenticate(user3)
    assert (
        client.get(f"/api/v1/t/{team.pk}/members/{user3_membership.id}/").status_code
        == status.HTTP_403_FORBIDDEN
    ), "removed user should not be able to access team"

    # admins can remove other admins
    team.force_join_admin(user3)
    assert team.is_admin(user3)
    client.force_authenticate(user3)
    res = client.delete(
        f"/api/v1/t/{team.pk}/members/{user.membership_set.get(team=team).id}/"
    )
    assert (
        res.status_code == status.HTTP_204_NO_CONTENT
    ), "Team admins can remove other admins"

    # admins cannot remove members of other teams
    empty_team.force_join(user)
    assert empty_team.is_member(user)
    assert team.is_admin(user3)
    client.force_authenticate(user3)
    assert (
        client.delete(
            f"/api/v1/t/{empty_team.pk}/members/{user.membership_set.get(team=empty_team).id}/"
        ).status_code
        == status.HTTP_403_FORBIDDEN
    ), "Admin users cannot remove member of another team"

    # members can remove their own membership
    empty_team.force_join(user2)
    assert empty_team.is_member(user2) and not empty_team.is_admin(user2)
    client.force_authenticate(user2)
    assert (
        client.delete(
            f"/api/v1/t/{empty_team.pk}/members/{user2.membership_set.get(team=empty_team).id}/"
        ).status_code
        == status.HTTP_204_NO_CONTENT
    )


def test_update_team_member(
    client: APIClient,
    team: Team,
    user: User,
    user2: User,
    user3: User,
    empty_team: Team,
) -> None:
    """
    Only admins should be able to update the membership of team members
    """
    user1_membership = user.membership_set.get(team=team)
    url = f"/api/v1/t/{team.pk}/members/{user1_membership.id}/"
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
    url = f"/api/v1/t/{team.pk}/members/{user2_membership.id}/"
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
    url = f"/api/v1/t/{empty_team.pk}/members/{user2_membership.id}/"
    assert client.patch(url, data).status_code == status.HTTP_403_FORBIDDEN


def test_create_team_invite(
    client: APIClient,
    team: Team,
    user: User,
    user2: User,
    user3: User,
    empty_team: Team,
) -> None:
    """
    TeamAdmins can create team invites
    """
    url = f"/api/v1/t/{team.id}/invites/"
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


def test_creating_invites_by_non_members(
    client: APIClient, team: Team, user2: User, user3: User, empty_team: Team
) -> None:
    # non-admins cannot create invite
    team.force_join(user2, Membership.CONTRIBUTOR)
    assert team.is_member(user2) and not team.is_admin(user2)
    url = f"/api/v1/t/{team.id}/invites/"
    client.force_authenticate(user2)
    res = client.post(url, {"emails": [user3.email]})
    assert res.status_code == status.HTTP_400_BAD_REQUEST

    # non-members cannot create invite
    assert not empty_team.is_member(user3)
    client.force_authenticate(user3)
    url = f"/api/v1/t/{empty_team.id}/invites/"
    res = client.post(url, {"emails": [user2.email]})
    assert res.status_code == status.HTTP_403_FORBIDDEN


def test_create_user_invite(
    client: APIClient, team: Team, user: User, user2: User
) -> None:
    """
    Create method not allowed. Invite must be created via team endpoint.
    """

    assert team.is_member(user)
    assert not team.is_member(user2)

    url = "/api/v1/invites/"

    for u in [user, user2]:
        client.force_authenticate(u)
        res = client.post(url, {"emails": [u.email], "level": Membership.ADMIN})
        assert res.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


def test_list_user_invites(
    client: APIClient, team: Team, user: User, user2: User
) -> None:
    """
    User should be allowed to list their invites
    """

    assert team.is_member(user)
    assert not team.is_member(user2)

    invite = team.invite_user(user2, creator=user2)

    url = "/api/v1/invites/"

    client.force_authenticate(user)
    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK
    assert not res.json(), "user should not get invite for user2"

    client.force_authenticate(user2)
    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK
    assert res.json()[0].get("id") == invite.id, "user 2 should get their own invite"


def test_retrieve_user_invite(
    client: APIClient, team: Team, user: User, user2: User
) -> None:
    """
    User should be allowed to retrieve a specific invite
    """

    assert team.is_member(user)
    assert not team.is_member(user2)

    client.force_authenticate(user)
    url = f"/api/v1/t/{team.id}/invites/"
    res = client.post(url, {"emails": [user2.email], "level": Membership.ADMIN})
    assert res.status_code == status.HTTP_201_CREATED


def test_user_invites(
    client: APIClient, team: Team, user: User, user2: User, user3: User
) -> None:
    # invite user2 to team
    client.force_authenticate(user)
    url = f"/api/v1/t/{team.id}/invites/"

    for data in [
        {"level": Membership.ADMIN},
        {"emails": [user2.email]},
        {"emails": [user.email]},
        {},
    ]:
        assert client.post(url, data).status_code == status.HTTP_400_BAD_REQUEST

    res = client.post(url, {"emails": [user2.email], "level": Membership.ADMIN})
    assert res.status_code == status.HTTP_201_CREATED
    assert user2.membership_set.filter(
        team=team
    ).exists(), "user should be a member of the team"
    assert not user2.membership_set.get(
        team=team
    ).is_active, "user membership should be inactive"
    assert Invite.objects.filter(membership__user=user2).exists(), "user has invite"

    # invite user3 to team
    client.force_authenticate(user)
    url = f"/api/v1/t/{team.id}/invites/"
    res = client.post(url, {"emails": [user3.email], "level": Membership.ADMIN})
    assert res.status_code == status.HTTP_201_CREATED

    # retrieve all invites for user2
    client.force_authenticate(user2)
    url = "/api/v1/invites/"
    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK
    assert len(res.json()) == 1

    # verify user cannot view team
    url = f"/api/v1/t/{team.id}/members/"
    res = client.get(url)
    assert res.status_code == status.HTTP_403_FORBIDDEN


def test_accept_team_invite(
    client: APIClient, team: Team, user: User, user2: User, user3: User
) -> None:
    """
    User should be able to activate their membership by
    POSTing to detail-accept
    """
    assert team.is_member(user)
    assert not team.is_member(user2)
    # invite user2 to team
    client.force_authenticate(user)
    url = f"/api/v1/t/{team.id}/invites/"
    res = client.post(url, {"emails": [user2.email], "level": Membership.ADMIN})
    assert res.status_code == status.HTTP_201_CREATED
    invite_pk = res.json()[0]["id"]
    assert Invite.objects.get(pk=invite_pk).status == Invite.OPEN

    # accept invite
    client.force_authenticate(user2)
    url = f"/api/v1/invites/{invite_pk}/accept/"
    res = client.post(url)
    assert res.status_code == status.HTTP_200_OK
    assert Invite.objects.get(pk=invite_pk).status == Invite.ACCEPTED

    # check user can view team
    url = f"/api/v1/t/{team.id}/members/"
    res = client.get(url)
    assert res.status_code == status.HTTP_200_OK


def test_decline_team_invite(
    client: APIClient, team: Team, user: User, user2: User
) -> None:
    """
    User should be able to decline their invite by
    POSTing to detail-decline.
    For now this should just delete an invite.
    """
    assert team.is_member(user)
    assert not team.is_member(user2)

    # invite user2 to team
    client.force_authenticate(user)
    url = f"/api/v1/t/{team.id}/invites/"
    res = client.post(url, {"emails": [user2.email], "level": Membership.ADMIN})
    assert res.status_code == status.HTTP_201_CREATED
    invite_pk = res.json()[0]["id"]
    assert Invite.objects.get(pk=invite_pk).status == Invite.OPEN

    # decline invite
    client.force_authenticate(user2)
    url = f"/api/v1/invites/{invite_pk}/decline/"
    res = client.post(url)
    assert res.status_code == status.HTTP_200_OK
    assert Invite.objects.get(pk=invite_pk).status == Invite.DECLINED

    # check user cannot view team
    url = f"/api/v1/t/{team.id}/members/"
    res = client.get(url)
    assert res.status_code == status.HTTP_403_FORBIDDEN, "Non member cannot view team"


def test_creating_team_with_name_and_emails(
    client: APIClient, user: User, user2: User, user3: User
) -> None:
    """
    ensure we can create a team with a name, and emails that we want to invite
    """

    client.force_authenticate(user)
    url = "/api/v1/t/"
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


def test_demoting_self_in_team_from_admin(
    client: APIClient, team: Team, user: User
) -> None:
    """
    prevent a user from demoting themselves if they are the last team member
    """

    assert team.is_member(user)
    assert team.membership_set.count() == 1

    user_membership = user.membership_set.get(team=team)

    url = f"/api/v1/t/{team.pk}/members/{user_membership.id}/"

    client.force_authenticate(user)
    res = client.patch(url, {"level": Membership.CONTRIBUTOR})
    assert res.status_code == status.HTTP_400_BAD_REQUEST

    assert team.is_member(user)


def test_deleting_last_membership_of_team(
    client: APIClient, team: Team, user: User
) -> None:
    assert team.is_member(user)
    assert team.membership_set.count() == 1
    user_membership = user.membership_set.get(team=team)

    url = f"/api/v1/t/{team.pk}/members/{user_membership.id}/"

    client.force_authenticate(user)
    res = client.delete(url)
    assert res.status_code == status.HTTP_400_BAD_REQUEST
