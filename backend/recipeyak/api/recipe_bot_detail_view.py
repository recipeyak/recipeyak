from __future__ import annotations

from django.shortcuts import get_object_or_404
from django.template import Context, Template
from rest_framework.decorators import api_view, permission_classes, renderer_classes
from rest_framework.permissions import AllowAny
from rest_framework.renderers import StaticHTMLRenderer
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.models.recipe import Recipe

template = Template(
    """\
<html>
<head>
<meta property="og:title" content="{{ recipe_title }}" />
<link rel="apple-touch-icon" href="https://recipeyak.imgix.net/recipeyak-logo-3x-white.png">
<meta http-equiv="refresh" content="0; url=https://recipeyak.com/recipes/{{ recipe_pk }}/">
</head>
</html>"""
)


def recipe_get_view(request: AuthedRequest, recipe_pk: str) -> Response:
    recipe = get_object_or_404(Recipe, pk=recipe_pk)

    recipe_title = recipe.name
    if recipe.author:
        recipe_title += f" by {recipe.author}"
    return Response(
        template.render(
            Context(
                {
                    "recipe_title": recipe_title,
                    "recipe_pk": recipe.pk,
                }
            )
        )
    )


@api_view(["GET"])
@permission_classes([AllowAny])
@renderer_classes([StaticHTMLRenderer])
def receipe_detail_view(request: AuthedRequest, recipe_pk: str) -> Response:
    return recipe_get_view(request, recipe_pk)
