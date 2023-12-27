from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.models import SearchClick


class SearchClickIngredient(RequestParams):
    id: int
    quantity: str
    name: str


class SearchClickRecipe(RequestParams):
    id: int
    name: str
    author: str | None
    tags: list[str] | None
    ingredients: list[SearchClickIngredient]
    archived_at: str | None
    scheduledCount: int


class SearchClickMatch(RequestParams):
    kind: str
    value: str


class SearchClickCreateParams(RequestParams):
    query: str
    recipe: SearchClickRecipe
    matches: list[SearchClickMatch]


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def search_click_create_view(request: AuthedRequest) -> Response:
    params = SearchClickCreateParams.parse_obj(request.data)

    search_click = SearchClick.objects.create(content=params.dict())

    return Response({"id": search_click.id})
