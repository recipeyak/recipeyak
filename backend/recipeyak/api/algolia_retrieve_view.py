from __future__ import annotations

import asyncio

from algoliasearch.search_client import SearchClient
from django.http import JsonResponse

from recipeyak import config
from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.team_update_view import get_teams


async def get_token(team_ids: list[int]) -> str:
    async with SearchClient.create(
        app_id=config.ALGOLIA_APPLICATION_ID, api_key=config.ALGOLIA_ADMIN_API_KEY
    ) as client:
        # https://www.algolia.com/doc/api-reference/api-methods/generate-secured-api-key/
        return client.generate_secured_api_key(
            config.ALGOLIA_SEARCH_ONLY_API_KEY,
            {
                "restrictIndices": "recipes",
                "filters": " OR ".join(f"team_id:{team_id}" for team_id in team_ids),
            },
        )


@endpoint()
def algolia_retrieve_view(request: AuthedHttpRequest) -> JsonResponse:
    # NOTE: this isn't really scalable if the user has a lot of teams.
    team_ids = list(get_teams(user=request.user).values_list("id", flat=True))
    return JsonResponse(
        {
            "app_id": config.ALGOLIA_APPLICATION_ID,
            "api_key": asyncio.run(get_token(team_ids=team_ids)),
        },
        status=200,
    )
