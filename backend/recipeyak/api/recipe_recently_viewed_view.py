from __future__ import annotations

from datetime import datetime

from typing_extensions import TypedDict

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.models import RecipeView, get_team


class PrimaryImageDict(TypedDict):
    id: int
    url: str
    backgroundUrl: str | None


class RecipeRecentlyViewedItem(TypedDict):
    id: int
    name: str
    author: str | None
    archivedAt: datetime | None
    primaryImage: PrimaryImageDict | None


@endpoint()
def recipe_recently_viewed_view(
    request: AuthedHttpRequest, params: None
) -> list[RecipeRecentlyViewedItem]:
    team = get_team(request.user)
    recipes: list[RecipeRecentlyViewedItem] = []
    for rv in (
        RecipeView.objects.select_related("recipe__primary_image")
        .filter(user=request.user)
        .filter(recipe__team=team)
        .order_by("-last_visited_at")[:6]
    ):
        recipes.append(
            {
                "id": rv.recipe.id,
                "name": rv.recipe.name,
                "author": rv.recipe.author,
                "archivedAt": rv.recipe.archived_at,
                "primaryImage": {
                    "id": rv.recipe.primary_image.id,
                    "url": rv.recipe.primary_image.public_url(),
                    "backgroundUrl": rv.recipe.primary_image.background_url,
                }
                if rv.recipe.primary_image is not None
                else None,
            }
        )

    return recipes
