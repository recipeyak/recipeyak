from __future__ import annotations

from collections import OrderedDict
from typing import Any, Optional

import yaml
from django.contrib.auth.decorators import login_required
from django.http import Http404, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_http_methods
from rest_framework import serializers

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import BaseModelSerializer
from recipeyak.api.serializers.recipe import IngredientSerializer, OwnerRelatedField
from recipeyak.models import Recipe, user_and_team_recipes


def represent_ordereddict(dumper: yaml.Dumper, data: dict[str, Any]) -> yaml.Node:
    value = []
    for item_key, item_value in data.items():
        node_key = dumper.represent_data(item_key)
        node_value = dumper.represent_data(item_value)
        value.append((node_key, node_value))
    return yaml.nodes.MappingNode("tag:yaml.org,2002:map", value)


yaml.add_representer(OrderedDict, represent_ordereddict)


class YamlResponse(HttpResponse):
    """
    An HTTP response class that consumes data to be serialized to YAML.
    :param data: Data to be dumped into yaml.
    """

    def __init__(self, data: Any, **kwargs: Any) -> None:
        kwargs.setdefault("content_type", "text/x-yaml")
        if isinstance(data, list):
            data = yaml.dump_all(data, default_flow_style=False, allow_unicode=True)
        else:
            # we wrap in an OrderedDict since PyYaml sorts dict keys for some odd reason!
            data = yaml.dump(
                OrderedDict(data), default_flow_style=False, allow_unicode=True
            )

        super().__init__(content=data, **kwargs)


class RecipeExportSerializer(BaseModelSerializer):

    steps = serializers.ListField(child=serializers.CharField(), source="step_set.all")

    ingredients = IngredientSerializer(
        many=True,
        read_only=True,
        fields=("quantity", "name", "description", "optional"),
        source="ingredient_set",
    )
    owner = OwnerRelatedField(read_only=True, export=True)

    class Meta:
        model = Recipe
        read_only = True
        fields = (
            "id",
            "name",
            "author",
            "time",
            "source",
            "servings",
            "ingredients",
            "steps",
            "owner",
            "tags",
        )


@require_http_methods(["GET"])
@login_required(login_url="/login/")
def export_recipes_list_view(
    request: AuthedRequest, filetype: str, pk: Optional[str] = None
) -> HttpResponse:

    queryset = user_and_team_recipes(request.user).prefetch_related(
        "owner", "step_set", "ingredient_set", "scheduledrecipe_set"
    )

    if pk is not None:
        queryset = get_object_or_404(queryset, pk=pk)  # type: ignore[assignment]

    many = pk is None

    recipes = RecipeExportSerializer(queryset, many=many).data

    if filetype in ("yaml", "yml"):
        return YamlResponse(recipes)

    if filetype == "json":
        # we need safe=False so we can serializer both lists and dicts
        return JsonResponse(recipes, json_dumps_params={"indent": 2}, safe=False)

    raise Http404("unknown export filetype")
