from __future__ import annotations

from collections import OrderedDict
from logging import getLogger
from typing import Any, NoReturn, cast

import yaml
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.db import connection
from django.http import Http404, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_http_methods
from rest_framework import serializers

from recipeyak.api.base.request import AuthedRequest
from recipeyak.models import Recipe, filter_recipes, get_team
from recipeyak.models.ingredient import Ingredient
from recipeyak.models.team import Team
from recipeyak.models.user import User

log = getLogger(__name__)


def represent_ordereddict(dumper: yaml.Dumper, data: dict[str, Any]) -> yaml.Node:
    value = []
    for item_key, item_value in data.items():
        node_key = dumper.represent_data(item_key)
        node_value = dumper.represent_data(item_value)
        value.append((node_key, node_value))
    return yaml.nodes.MappingNode("tag:yaml.org,2002:map", value)


yaml.add_representer(OrderedDict, represent_ordereddict)


class UnexpectedDatabaseAccess(Exception):  # noqa: N818
    pass


def blocker(*args: object) -> NoReturn:
    raise UnexpectedDatabaseAccess


def warning_blocker(
    execute: Any, sql: Any, params: Any, many: Any, context: Any
) -> Any:
    """
    expected to call `execute` and return the call's result:
    https://docs.djangoproject.com/en/dev/topics/db/instrumentation/#connection-execute-wrapper
    """
    log.warning("Database access in serializer.")
    return execute(sql, params, many, context)


class DBBlockerSerializerMixin:
    """
    Block database access within serializer

    An escape hatch is available through the `dangerously_allow_db` kwarg.

    NOTE: This mixin should come _before_ the parent serializer. This is
    required for the constructor to remove `dangerously_allow_db` from `kwargs`
    before calling the parent.
    """

    def to_representation(self, instance: Any) -> Any:
        if self.dangerously_allow_db:
            return super().to_representation(instance)  # type: ignore [misc]

        if settings.ERROR_ON_SERIALIZER_DB_ACCESS:
            # only raise error when we are in DEBUG mode. We don't want to cause
            # errors in production when we don't need to do so.
            with connection.execute_wrapper(blocker):
                return super().to_representation(instance)  # type: ignore [misc]

        # use a warning blocker elsewhere
        with connection.execute_wrapper(warning_blocker):
            return super().to_representation(instance)  # type: ignore [misc]

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        self.dangerously_allow_db = kwargs.pop("dangerously_allow_db", None)
        cast(Any, super()).__init__(*args, **kwargs)


class BaseModelSerializer(DBBlockerSerializerMixin, serializers.ModelSerializer):
    """
    Serializer with `DBBlockerSerializerMixin` to disable DB access.
    """


class BaseRelatedField(DBBlockerSerializerMixin, serializers.RelatedField):
    """
    Serializer with `DBBlockerSerializerMixin` to disable DB access.
    """


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


class OwnerRelatedField(BaseRelatedField):
    """
    A custom field to use for the `owner` generic relationship.
    """

    def to_representation(self, value: Any) -> dict[str, Any]:
        if isinstance(value, Team):
            if self.export:
                return {"team": value.name}
            return {"id": value.id, "type": "team", "name": value.name}
        if isinstance(value, User):
            if self.export:
                return {"user": value.email}
            return {"id": value.id, "type": "user"}
        raise Exception("Unexpected type of owner object")

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        export = kwargs.pop("export", None)
        super().__init__(*args, **kwargs)
        self.export = export


class IngredientSerializer(BaseModelSerializer):
    """
    serializer the ingredient of a recipe
    """

    class Meta:
        model = Ingredient
        fields = ("id", "quantity", "name", "description", "position", "optional")

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop("fields", None)

        super().__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


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
    request: AuthedRequest, filetype: str, pk: str | None = None
) -> HttpResponse:
    team = get_team(request)

    queryset = filter_recipes(team=team).prefetch_related(
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
