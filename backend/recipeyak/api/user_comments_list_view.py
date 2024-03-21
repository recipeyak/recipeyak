import pydantic
from django.http import Http404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.serializers.recipe import NoteResponse, serialize_note
from recipeyak.api.user_retrieve_by_id_view import has_team_connection
from recipeyak.models import filter_notes, get_team


class Recipe(pydantic.BaseModel):
    id: int
    name: str


class Comment(pydantic.BaseModel):
    recipe: Recipe
    note: NoteResponse


class UserCommentsListResponse(pydantic.BaseModel):
    comments: list[Comment]


class UserCommentsListParams(RequestParams):
    user_id: str


@endpoint()
def user_comments_list_view(
    request: AuthedHttpRequest, params: UserCommentsListParams
) -> JsonResponse[UserCommentsListResponse]:
    user_id = params.user_id
    if not has_team_connection(user_id, request.user.id):
        raise Http404
    team = get_team(request.user)

    notes = [
        Comment(
            recipe=Recipe(id=note.recipe.id, name=note.recipe.name),
            note=serialize_note(note, primary_image_id=0),
        )
        for note in filter_notes(team=team)
        .prefetch_related(
            "recipe",
            "reactions",
            "reactions__created_by",
            "uploads",
            "created_by",
            "last_modified_by",
        )
        .filter(created_by=user_id)
        .order_by("-created")
    ]

    return JsonResponse(UserCommentsListResponse(comments=notes))
