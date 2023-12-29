from __future__ import annotations

import pydantic
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.models.upload import Upload


class CompleteUploadResponse(pydantic.BaseModel):
    id: str
    url: str
    contentType: str


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_complete_view(request: AuthedRequest, upload_id: int) -> Response:
    upload = get_object_or_404(
        Upload.objects.filter(created_by=request.user), pk=upload_id
    )
    upload.completed = True
    upload.save()

    return Response(
        CompleteUploadResponse(
            id=upload.pk, url=upload.public_url(), contentType=upload.content_type
        )
    )
