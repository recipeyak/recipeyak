from __future__ import annotations

from collections.abc import Container

import pydantic
from django.http import Http404, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import YamlResponse
from recipeyak.models import Recipe, filter_recipes, get_team
from recipeyak.models.team import Team


class ExportIngredient(pydantic.BaseModel):
    quantity: str
    name: str
    description: str
    optional: bool


class ExportSection(pydantic.BaseModel):
    section: str


class ExportRecipe(pydantic.BaseModel):
    id: int
    name: str
    author: str | None = None
    time: str | None = None
    source: str | None = None
    ingredients: list[ExportIngredient | ExportSection]
    steps: list[str]
    tags: list[str] | None = None


def serialize_export_recipe(recipe: Recipe) -> ExportRecipe:
    sections_and_ingredients = list[tuple[str, ExportSection | ExportIngredient]]()
    for ingredient in recipe.ingredient_set.all():
        sections_and_ingredients.append(
            (
                ingredient.position,
                ExportIngredient(
                    quantity=ingredient.quantity,
                    name=ingredient.name,
                    description=ingredient.description,
                    optional=ingredient.optional,
                ),
            )
        )
    for section in recipe.section_set.all():
        sections_and_ingredients.append(
            (
                section.position,
                ExportSection(section=section.title),
            )
        )

    sections_and_ingredients.sort(key=lambda x: x[0])

    steps = [(s.position, s.text) for s in recipe.step_set.all()]

    steps.sort(key=lambda x: x[0])

    return ExportRecipe(
        id=recipe.id,
        name=recipe.name,
        author=recipe.author,
        source=recipe.source,
        time=recipe.time,
        ingredients=[x for (_, x) in sections_and_ingredients],
        steps=[text for (_, text) in steps],
        tags=recipe.tags,
    )


IGNORED_VALUES: Container[object] = ([], "", False, None)


def fmt_dict(obj: dict[str, object]) -> dict[str, object]:
    out = {}
    for k, v in obj.items():
        if v in IGNORED_VALUES:
            continue
        out[k] = v
    return out


def pydantic_to_dict(obj: object) -> object:
    if isinstance(obj, pydantic.BaseModel):
        obj_dict = obj.dict()
        for attr_name, attr_value in obj_dict.items():
            if isinstance(attr_value, list):
                obj_dict[attr_name] = [pydantic_to_dict(item) for item in attr_value]
            elif isinstance(attr_value, pydantic.BaseModel):
                obj_dict[attr_name] = pydantic_to_dict(attr_value)
            if isinstance(attr_value, str) and attr_value == "":
                obj_dict[attr_name] = None
        return fmt_dict(obj_dict)
    if isinstance(obj, list):
        return [pydantic_to_dict(item) for item in obj]
    if isinstance(obj, dict):
        return fmt_dict(obj)
    return obj


def export_recipes(team: Team, pk: str | None) -> list[ExportRecipe] | ExportRecipe:
    queryset = filter_recipes(team=team).prefetch_related("step_set", "ingredient_set")

    if pk is not None:
        r = get_object_or_404(queryset, pk=pk)
        return serialize_export_recipe(r)

    recipes_out = list[ExportRecipe]()
    for recipe in queryset:
        recipes_out.append(serialize_export_recipe(recipe))

    return recipes_out


@endpoint(redirect_to_login=True)
def export_recipes_list_view(
    request: AuthedHttpRequest[None], filetype: str, pk: str | None = None
) -> HttpResponse:
    team = get_team(request.user)

    recipes = pydantic_to_dict(export_recipes(team, pk))

    if filetype in ("yaml", "yml"):
        return YamlResponse(recipes)

    if filetype == "json":
        # we need safe=False so we can serializer both lists and dicts
        return JsonResponse(recipes, json_dumps_params={"indent": 2}, safe=False)

    raise Http404("unknown export filetype")
