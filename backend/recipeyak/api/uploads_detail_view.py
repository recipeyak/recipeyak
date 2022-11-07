from __future__ import annotations

import pydantic
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.shortcuts import get_object_or_404
from recipeyak.api.base.request import AuthedRequest
from recipeyak.models.upload import Upload


class CompleteUploadResponse(pydantic.BaseModel):
    id: str
    url: str


@api_view(["POST"])
@permission_classes(
    [
        IsAuthenticated,
    ]
)
def complete_upload_view(request: AuthedRequest, upload_pk: int) -> Response:
    upload = get_object_or_404(
        Upload.objects.filter(created_by=request.user), pk=upload_pk
    )
    upload.completed = True
    upload.save()

    return Response(
        CompleteUploadResponse(
            id=upload.pk,
            url=upload.public_url(),
        )
    )
