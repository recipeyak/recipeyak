from __future__ import annotations

from typing import Literal, assert_never
from uuid import uuid4

import pydantic

from recipeyak import config
from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.models import filter_recipes, get_team
from recipeyak.models.recipe import Recipe
from recipeyak.models.upload import Upload, s3
from recipeyak.models.user import User


class StartUploadParams(RequestParams):
    file_name: str
    content_type: str
    content_length: int
    recipe_id: int | None = None
    purpose: Literal["recipe", "profile"] = "recipe"

    @pydantic.model_validator(mode="after")
    def validate_purpose_and_id(self) -> StartUploadParams:
        recipe_id = self.recipe_id
        purpose = self.purpose
        if purpose == "recipe" and recipe_id is None:
            raise ValueError("recipe_id is required when purpose is recipe")
        if purpose == "profile" and recipe_id is not None:
            raise ValueError("recipe_id is not allowed when purpose is profile")
        return self


class StartUploadResponse(pydantic.BaseModel):
    id: str
    upload_url: str
    upload_headers: dict[str, str]


@endpoint()
def upload_start_view(request: AuthedHttpRequest) -> JsonResponse:
    params = StartUploadParams.parse_raw(request.body)
    key = f"{request.user.id}/{uuid4().hex}/{params.file_name}"
    team = get_team(request.user)

    recipe: Recipe | None = None
    profile: User | None = None
    if params.purpose == "recipe":
        recipe = filter_recipes(team=team).filter(id=params.recipe_id).first()
        if recipe is None:
            return JsonResponse(
                {"error": {"message": "Could not find recipe with provided ID."}},
                status=400,
            )
    elif params.purpose == "profile":
        profile = request.user
    else:
        assert_never(params.purpose)

    upload = Upload(
        created_by=request.user,
        bucket=config.STORAGE_BUCKET_NAME,
        key=key,
        recipe=recipe,
        profile=profile,
        content_type=params.content_type,
    )
    upload.save()

    upload_url = s3.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": config.STORAGE_BUCKET_NAME,
            "Key": key,
            "ContentLength": params.content_length,
            "ContentType": params.content_type,
            "Metadata": {"db_id": str(upload.pk)},
        },
    )

    return JsonResponse(
        StartUploadResponse(
            id=str(upload.pk),
            upload_url=upload_url,
            upload_headers={"x-amz-meta-db_id": str(upload.pk)},
        )
    )
