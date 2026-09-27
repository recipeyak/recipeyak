from __future__ import annotations

import asyncio
from functools import cache

from ably import AblyRest

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.team_update_view import get_teams
from recipeyak.config import ABLY_API_KEY


@cache
def ably_client() -> AblyRest:
    # Constructing a client builds an HTTP client and SSL context, which is
    # most of this endpoint's cost. Token requests are signed locally, so the
    # HTTP client is never used and can be shared across requests.
    return AblyRest(ABLY_API_KEY)


async def get_token(user_id: str, team_ids: list[int]) -> dict[str, object]:
    res = await ably_client().auth.create_token_request(
        {
            "client_id": user_id,
            "capability": {
                f"team:{team_id}:*": ["subscribe", "presence"] for team_id in team_ids
            },
        }
    )

    return res.to_dict()


@endpoint()
def ably_retrieve_view(request: AuthedHttpRequest, params: None) -> dict[str, object]:
    # NOTE: this isn't really scalable if the user has a lot of teams.
    team_ids = list(get_teams(user=request.user).values_list("id", flat=True))
    return asyncio.run(
        get_token(user_id=str(request.user.id), team_ids=team_ids),
    )
