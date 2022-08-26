from __future__ import annotations

from pydantic import Field
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from typing_extensions import Literal

from core.models import Team, User, user_and_team_recipe_or_404
from core.recipes.serializers import RecipeSerializer
from core.request import AuthedRequest
from core.serialization import RequestParams


class RecipeMoveParams(RequestParams):
    type: Literal["team", "user"]
    owner_pk: str = Field(alias="id")


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def recipe_move_view(request: AuthedRequest, recipe_pk: str) -> Response:
    """
    Move recipe from user to another team.
    User should have write access to team to move recipe

    /recipes/<recipe_id>/move
        {'id':<team_id>, type:'team'}
    """
    recipe = user_and_team_recipe_or_404(request.user, recipe_pk=recipe_pk)
    params = RecipeMoveParams.parse_obj(request.data)

    if params.type == "team":
        team = Team.objects.get(id=params.owner_pk)
        if not (team.is_contributor(request.user) or team.is_admin(request.user)):
            raise PermissionDenied(detail="user must have write permissions")
        recipe.move_to(team)
    elif params.type == "user":
        user = User.objects.get(id=params.owner_pk)
        if user != request.user:
            raise PermissionDenied(detail="user must be the same as requester")
        recipe.move_to(user)

    return Response(
        RecipeSerializer(recipe, context={"request": request}).data,
        status=status.HTTP_200_OK,
    )
