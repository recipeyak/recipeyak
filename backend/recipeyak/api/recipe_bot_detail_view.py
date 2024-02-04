from __future__ import annotations

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.template import Context, Template
from yarl import URL

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AnonymousHttpRequest
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
<meta http-equiv="refresh" content="0; url=https://recipeyak.com/recipes/{{ recipe_id }}/">
</head>
</html>"""
)


def _format_img_open_graph(x: str) -> str:
    """
    Open graph images are recommended to be 1200x630, so we use Imgix to crop.
    """
    return str(
        URL(x).with_query(
            {
                "w": "1200",
                "h": "910",
                "fit": "crop",
                "q": "30",
            }
        )
    )


def _recipe_get_view(
    request: AnonymousHttpRequest[None], recipe_id: str
) -> HttpResponse:
    recipe = get_object_or_404(Recipe, pk=recipe_id)

    recipe_title = recipe.name
    if recipe.author:
        recipe_title += f" by {recipe.author}"
    return HttpResponse(
        template.render(
            Context(
                {
                    "recipe_title": recipe_title,
                    "recipe_id": recipe.pk,
                    "recipe_image_url": _format_img_open_graph(
                        recipe.primary_image.public_url()
                    )
                    if recipe.primary_image
                    else None,
                }
            )
        )
    )


@endpoint(auth_required=False)
def recipe_bot_detail_view(
    request: AnonymousHttpRequest[None], recipe_id: str
) -> HttpResponse:
    return _recipe_get_view(request, recipe_id)
