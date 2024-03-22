from __future__ import annotations

from typing import Literal

from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from psycopg2.errors import UniqueViolation

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import Params
from recipeyak.api.serializers.recipe import ReactionSerializer, serialize_reactions
from recipeyak.models import filter_notes, get_team, user_reactions
from recipeyak.models.reaction import Reaction
from recipeyak.realtime import publish_recipe

EMOJIS = Literal["❤️", "😆", "🤮"]


class ReactionCreateParams(Params):
    type: EMOJIS
    note_id: str


@endpoint()
def reaction_create_view(
    request: AuthedHttpRequest, params: ReactionCreateParams
) -> JsonResponse[ReactionSerializer]:
    team = get_team(request.user)

    note = get_object_or_404(filter_notes(team=team), pk=params.note_id)
    reaction = Reaction(emoji=params.type, created_by=request.user, note=note)
    try:
        reaction.save()
    except IntegrityError as e:
        if (
            isinstance(e.__cause__, UniqueViolation)
            and e.__cause__.diag.constraint_name == "one_reaction_per_user"
        ):
            reaction = user_reactions(user=request.user).filter(note=note).get()
        else:
            raise
    publish_recipe(recipe_id=note.recipe_id, team_id=team.id)
    return JsonResponse(next(iter(serialize_reactions([reaction]))))
