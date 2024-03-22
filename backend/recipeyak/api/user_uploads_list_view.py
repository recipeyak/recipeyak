import pydantic
from django.http import Http404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import Params
from recipeyak.api.user_retrieve_by_id_view import has_team_connection
from recipeyak.models import filter_uploads, get_team
from recipeyak.models.upload import Upload


class RecipeResponse(pydantic.BaseModel):
    id: int
    name: str


class NoteResponse(pydantic.BaseModel):
    id: int
    recipe: RecipeResponse


class UploadResponse(pydantic.BaseModel):
    id: int
    url: str
    backgroundUrl: str | None
    contentType: str
    note: NoteResponse


class UserUploadsListResponse(pydantic.BaseModel):
    uploads: list[UploadResponse]


def serialize_note(upload: Upload) -> NoteResponse:
    if upload.recipe is None:
        raise ValueError("Expected recipe to exist")
    if upload.note_id is None:
        raise ValueError("Expected note to exist")
    return NoteResponse(
        id=upload.note_id,
        recipe=RecipeResponse(id=upload.recipe.id, name=upload.recipe.name),
    )


class UserUploadsListParams(Params):
    user_id: str


@endpoint()
def user_uploads_list_view(
    request: AuthedHttpRequest, params: UserUploadsListParams
) -> JsonResponse[UserUploadsListResponse]:
    if not has_team_connection(params.user_id, request.user.id):
        raise Http404
    team = get_team(request.user)

    uploads = [
        UploadResponse(
            id=upload.id,
            url=upload.public_url(),
            backgroundUrl=upload.background_url,
            contentType=upload.content_type,
            note=serialize_note(upload),
        )
        for upload in filter_uploads(team=team, user_id=params.user_id)
        .prefetch_related("recipe")
        .exclude(recipe_id=None)
        .exclude(note=None)
        .order_by("-created")
    ]

    return JsonResponse(UserUploadsListResponse(uploads=uploads))
