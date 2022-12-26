from __future__ import annotations

from django.shortcuts import get_object_or_404
from django.template import Context, Template
from rest_framework.decorators import api_view, permission_classes, renderer_classes
from rest_framework.permissions import AllowAny
from rest_framework.renderers import StaticHTMLRenderer
from rest_framework.response import Response
from yarl import URL

from recipeyak.api.base.request import AuthedRequest
from recipeyak.models.recipe import Recipe

template = Template(
    """\
<html>
<head>
<meta property="og:title" content="{{ recipe_title }}" />
{% if recipe_image_url %}
<meta property="og:image" content="{{ recipe_image_url | safe }}" />
{% endif %}
<link rel="apple-touch-icon" href="https://recipeyak.imgix.net/recipeyak-logo-3x-white.png">
<meta http-equiv="refresh" content="0; url=https://recipeyak.com/recipes/{{ recipe_pk }}/">
</head>
</html>"""
)


def format_img_open_graph(x: str) -> str:
    """
    Open graph images are recommended to be 1200x630, so we use Imgix to crop.
    """
    return str(
        URL(x).with_query(
            {
                "w": "1200",
                "h": "630",
                "fit": "crop",
                "q": "30",
            }
        )
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
                    "recipe_image_url": format_img_open_graph(
                        recipe.primary_image.public_url()
                    )
                    if recipe.primary_image
                    else None,
                }
            )
        )
    )


@api_view(["GET"])
@permission_classes([AllowAny])
@renderer_classes([StaticHTMLRenderer])
def receipe_detail_view(request: AuthedRequest, recipe_pk: str) -> Response:
    return recipe_get_view(request, recipe_pk)
