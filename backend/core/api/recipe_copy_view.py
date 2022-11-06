from __future__ import annotations

from pydantic import Field
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from typing_extensions import Literal

from core.api.base.request import AuthedRequest
from core.api.base.serialization import RequestParams
from core.api.serializers.recipe import RecipeSerializer
from core.models import Recipe, Team, User, user_and_team_recipe_or_404


class RecipeCopyParams(RequestParams):
    type: Literal["team", "user"]
    owner_pk: str = Field(alias="id")


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def recipe_copy_view(request: AuthedRequest, recipe_pk: str) -> Response:
    """
    Copy recipe from user to team.
    Any team member should be able to copy a recipe from the team.
    User should have write access to team to copy recipe
    """
    recipe = user_and_team_recipe_or_404(request.user, recipe_pk=recipe_pk)
    params = RecipeCopyParams.parse_obj(request.data)

    if params.type == "team":
        team = Team.objects.get(id=params.owner_pk)
        if not (team.is_contributor(request.user) or team.is_admin(request.user)):
            raise PermissionDenied(detail="user must have write permissions")
        new_recipe = recipe.copy_to(account=team, actor=request.user)
    elif params.type == "user":
        user = User.objects.get(id=params.owner_pk)
        if user != request.user:
            raise PermissionDenied(detail="user must be the same as requester")
        new_recipe = recipe.copy_to(account=user, actor=request.user)

    # refetch all relations before serialization
    prefetched_recipe: Recipe = Recipe.objects.prefetch_related(
        "owner",
        "step_set",
        "ingredient_set",
        "scheduledrecipe_set",
        "notes",
        "notes__uploads",
        "notes__reactions",
        "notes__reactions__created_by",
        "timelineevent_set",
        "section_set",
    ).get(id=new_recipe.id)
    return Response(RecipeSerializer(prefetched_recipe).data, status=status.HTTP_200_OK)
