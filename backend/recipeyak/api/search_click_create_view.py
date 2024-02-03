from __future__ import annotations

from typing_extensions import TypedDict

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.models import SearchClick


class SearchClickIngredientParams(RequestParams):
    id: int
    quantity: str
    name: str


class SearchClickRecipeParams(RequestParams):
    id: int
    name: str
    author: str | None = None
    tags: list[str] | None = None
    ingredients: list[SearchClickIngredientParams]
    archived_at: str | None = None
    scheduledCount: int


class SearchClickMatchParams(RequestParams):
    kind: str
    value: str


class SearchClickCreateParams(RequestParams):
    query: str
    recipe: SearchClickRecipeParams
    matches: list[SearchClickMatchParams]


class SearchClickResponse(TypedDict):
    id: int


@endpoint()
def search_click_create_view(
    request: AuthedHttpRequest[SearchClickCreateParams]
) -> JsonResponse[SearchClickResponse]:
    params = SearchClickCreateParams.parse_raw(request.body)

    search_click = SearchClick.objects.create(content=params.dict())

    return JsonResponse({"id": search_click.id})
