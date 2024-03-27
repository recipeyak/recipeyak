from __future__ import annotations

from datetime import UTC, datetime, timedelta

from algoliasearch.search_client import SearchClient

from recipeyak import config
from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.models import get_team


def get_token(team_id: int) -> str:
    # https://www.algolia.com/doc/api-reference/api-methods/generate-secured-api-key/
    return SearchClient.generate_secured_api_key(
        config.ALGOLIA_SEARCH_ONLY_API_KEY,
        {
            "filters": f"team_id:{team_id}",
            "validUntil": int((datetime.now(tz=UTC) + timedelta(hours=1)).timestamp()),
        },
    )


@endpoint()
def algolia_retrieve_view(request: AuthedHttpRequest, params: None) -> dict[str, str]:
    team = get_team(request.user)
    return {
        "app_id": config.ALGOLIA_APPLICATION_ID,
        "api_key": get_token(team_id=team.pk),
    }
