from __future__ import annotations

import asyncio

from ably import AblyRest

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
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


@endpoint()
def ably_retrieve_view(request: AuthedHttpRequest) -> JsonResponse:
    # NOTE: this isn't really scalable if the user has a lot of teams.
    team_ids = list(get_teams(user=request.user).values_list("id", flat=True))
    return JsonResponse(
        asyncio.run(get_token(user_id=str(request.user.id), team_ids=team_ids)),
        status=200,
    )
