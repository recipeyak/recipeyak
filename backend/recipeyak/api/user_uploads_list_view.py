import pydantic
from django.http import Http404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.user_retrieve_by_id_view import has_team_connection
from recipeyak.models import filter_uploads, get_team
from recipeyak.models.upload import Upload


class RecipeResponse(pydantic.BaseModel):
    id: int
    name: str


class UploadResponse(pydantic.BaseModel):
    id: int
    url: str
    backgroundUrl: str | None
    contentType: str
    recipe: RecipeResponse


class UserPhotosListResponse(pydantic.BaseModel):
    uploads: list[UploadResponse]


def serialize_recipe(upload: Upload) -> RecipeResponse:
    if upload.recipe is None:
        raise ValueError("Expected recipe to exist")
    return RecipeResponse(id=upload.recipe.id, name=upload.recipe.name)


@endpoint()
def user_uploads_list_view(request: AuthedHttpRequest, user_id: str) -> JsonResponse:
    if not has_team_connection(user_id, request.user.id):
        raise Http404
    team = get_team(request.user)

    uploads = [
        UploadResponse(
            id=upload.id,
            url=upload.public_url(),
            backgroundUrl=upload.background_url,
            contentType=upload.content_type,
            recipe=serialize_recipe(upload),
        )
        for upload in filter_uploads(team=team, user=request.user)
        .prefetch_related("recipe")
        .exclude(recipe_id=None)
        .exclude(note=None)
        .order_by("-created")
    ]

    return JsonResponse(UserPhotosListResponse(uploads=uploads))
