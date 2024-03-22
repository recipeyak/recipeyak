from __future__ import annotations

from django.db import connection

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import Params
from recipeyak.api.serializers.recipe import RecipeSerializer, serialize_recipe
from recipeyak.models import (
    filter_recipe_or_404,
    get_team,
)


class RecipeRetrieveParams(Params):
    recipe_id: int


@endpoint()
def recipe_retrieve_view(
    request: AuthedHttpRequest, params: RecipeRetrieveParams
) -> JsonResponse[RecipeSerializer]:
    team = get_team(request.user)
    recipe = filter_recipe_or_404(recipe_id=params.recipe_id, team=team)
    with connection.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO recipe_view (recipe_id, user_id, last_visited_at, count, created, modified)
            VALUES (%(recipe_id)s, %(user_id)s, now(), 1, now(), now())
            ON CONFLICT
            ON CONSTRAINT one_user_view_row_per_recipe
            DO UPDATE SET
                last_visited_at =
                    CASE WHEN recipe_view.last_visited_at < now() - '1 hour'::interval THEN
                        now()
                    ELSE
                        recipe_view.last_visited_at
                    END,
                count =
                    CASE WHEN recipe_view.last_visited_at < now() - '1 hour'::interval THEN
                        recipe_view.count + 1
                    ELSE
                        recipe_view.count
                    END
            """,
            {"user_id": request.user.id, "recipe_id": recipe.id},
        )

    return JsonResponse(serialize_recipe(recipe))
