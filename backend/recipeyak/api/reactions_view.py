from __future__ import annotations

from typing import Literal

from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from psycopg2.errors import UniqueViolation
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.serializers.recipe import serialize_reactions
from recipeyak.models import filter_notes, get_team, user_reactions
from recipeyak.models.reaction import Reaction

EMOJIS = Literal["❤️", "😆", "🤮"]


class ReactToNoteViewParams(RequestParams):
    type: EMOJIS


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def note_reaction_create_view(request: AuthedRequest, note_pk: int) -> Response:
    params = ReactToNoteViewParams.parse_obj(request.data)

    team = get_team(request)

    note = get_object_or_404(filter_notes(team=team), pk=note_pk)
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
    return Response(next(iter(serialize_reactions([reaction]))))


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def note_reaction_delete_view(request: AuthedRequest, reaction_pk: str) -> Response:
    user_reactions(user=request.user).filter(pk=reaction_pk).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
