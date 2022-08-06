from __future__ import annotations

from typing import Dict
from uuid import uuid4

import pydantic
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core import config
from core.models.upload import Upload, s3
from core.request import AuthedRequest


class StartUploadParams(pydantic.BaseModel):
    file_name: str
    content_type: str
    content_length: int


class StartUploadResponse(pydantic.BaseModel):
    id: str
    upload_url: str
    upload_headers: Dict[str, str]


@api_view(["POST"])
@permission_classes(
    [
        IsAuthenticated,
    ]
)
def start_upload(request: AuthedRequest) -> Response:
    params = StartUploadParams.parse_obj(request.data)
    key = f"{request.user.id}/{uuid4().hex}/{params.file_name}"
    upload = Upload(
        created_by=request.user,
        bucket=config.STORAGE_BUCKET_NAME,
        key=key,
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

    return Response(
        StartUploadResponse(
            id=upload.pk,
            upload_url=upload_url,
            upload_headers={"x-amz-meta-db_id": upload.pk},
        ).dict()
    )


class CompleteUploadResponse(pydantic.BaseModel):
    id: str
    url: str


@api_view(["POST"])
@permission_classes(
    [
        IsAuthenticated,
    ]
)
def complete_upload(request: AuthedRequest, upload_pk: int) -> Response:
    upload = get_object_or_404(
        Upload.objects.filter(created_by=request.user), pk=upload_pk
    )
    upload.completed = True
    upload.save()

    return Response(
        CompleteUploadResponse(
            id=upload.pk,
            url=upload.public_url(),
        ).dict()
    )
