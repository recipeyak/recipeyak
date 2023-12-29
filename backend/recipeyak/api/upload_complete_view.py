from __future__ import annotations

import pydantic
from django.shortcuts import get_object_or_404

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.models.upload import Upload


class CompleteUploadResponse(pydantic.BaseModel):
    id: str
    url: str
    contentType: str


@endpoint()
def upload_complete_view(request: AuthedHttpRequest, upload_id: int) -> JsonResponse:
    upload = get_object_or_404(
        Upload.objects.filter(created_by=request.user), pk=upload_id
    )
    upload.completed = True
    upload.save()

    return JsonResponse(
        CompleteUploadResponse(
            id=upload.pk, url=upload.public_url(), contentType=upload.content_type
        )
    )
