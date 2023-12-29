from __future__ import annotations

import asyncio

from algoliasearch.search_client import SearchClient
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak import config
from recipeyak.api.base.request import AuthedRequest
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


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def algolia_detail_view(request: AuthedRequest) -> Response:
    # NOTE: this isn't really scalable if the user has a lot of teams.
    team_ids = list(get_teams(user=request.user).values_list("id", flat=True))
    return Response(
        {
            "app_id": config.ALGOLIA_APPLICATION_ID,
            "api_key": asyncio.run(get_token(team_ids=team_ids)),
        },
        status=status.HTTP_200_OK,
    )
