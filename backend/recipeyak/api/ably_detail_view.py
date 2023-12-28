from __future__ import annotations

import asyncio

from ably import AblyRest
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.team_update_view import get_teams
from recipeyak.config import ABLY_API_KEY


async def get_token(user_id: str, team_ids: list[int]) -> dict[str, object]:
    async with AblyRest(ABLY_API_KEY) as ably:
        res = await ably.auth.create_token_request(
            {
                "clientId": user_id,
                "capability": {
                    f"scheduled_recipe:{team_id}": ["subscribe"] for team_id in team_ids
                }
                | {
                    f"cook_checklist:{team_id}:*": ["subscribe"] for team_id in team_ids
                },
            }
        )

        return res.to_dict()


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ably_detail_view(request: AuthedRequest) -> Response:
    # NOTE: this isn't really scalable if the user has a lot of teams.
    team_ids = list(get_teams(user=request.user).values_list("id", flat=True))
    return Response(
        asyncio.run(get_token(user_id=str(request.user.id), team_ids=team_ids)),
        status=status.HTTP_200_OK,
    )
