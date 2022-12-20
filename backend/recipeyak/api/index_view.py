from django.views.decorators.http import require_http_methods
from django.http import HttpRequest, HttpResponse
from django.template.loader import render_to_string
from django.shortcuts import get_object_or_404
from recipeyak.models.recipe import Recipe
import json


@require_http_methods(["GET", "HEAD"])
def index_view(request: HttpRequest) -> HttpResponse:
    recipe_pk = "54"
    recipe = get_object_or_404(Recipe, pk=recipe_pk)

    recipe_title = recipe.name
    if recipe.author:
        recipe_title += f" by {recipe.author}"
    rendered = render_to_string(
        "index.html",
        {
            "recipe_title": recipe_title,
            "recipe_pk": recipe.pk,
            "initial": json.dumps(
                {
                    "id": 123,
                    "email": "example@example.com",
                    "name": "foo",
                    "avatar_url": "/avatars/foo.jpeg",
                    "schedule_team": 1,
                }
            ),
        },
    )
    response = HttpResponse()
    response.content = rendered
    return response
