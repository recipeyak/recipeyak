from __future__ import annotations

from typing import Literal

from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from psycopg2.errors import UniqueViolation

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.serializers.recipe import ReactionResponse, serialize_reactions
from recipeyak.models import filter_notes, get_team, user_reactions
from recipeyak.models.reaction import Reaction

EMOJIS = Literal["❤️", "😆", "🤮"]


class ReactToNoteViewParams(RequestParams):
    type: EMOJIS


@endpoint()
def reaction_create_view(
    request: AuthedHttpRequest[ReactToNoteViewParams], note_id: str
) -> JsonResponse[ReactionResponse]:
    params = ReactToNoteViewParams.parse_raw(request.body)

    team = get_team(request.user)

    note = get_object_or_404(filter_notes(team=team), pk=note_id)
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
    return JsonResponse(next(iter(serialize_reactions([reaction]))))
