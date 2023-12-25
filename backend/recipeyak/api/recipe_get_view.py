from __future__ import annotations

from django.db import connection
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.serializers.recipe import serialize_recipe
from recipeyak.models import (
    filter_recipe_or_404,
    get_team,
)


def recipe_get_view(request: AuthedRequest, recipe_pk: str) -> Response:
    team = get_team(request)
    recipe = filter_recipe_or_404(recipe_pk=recipe_pk, team=team)
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

    return Response(serialize_recipe(recipe))
