from __future__ import annotations

import pydantic
from django.db import transaction
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
def upload_complete_view(
    request: AuthedHttpRequest[None], upload_id: int
) -> JsonResponse[CompleteUploadResponse]:
    with transaction.atomic():
        upload = get_object_or_404(
            Upload.objects.filter(created_by=request.user), pk=upload_id
        )
        upload.completed = True
        # A little bodgy but set the upload on the user when we're done, maybe
        # we can structure this better
        if upload.profile is not None:
            user = upload.profile
            user.profile_upload = upload
            user.save()
        upload.save()

    return JsonResponse(
        CompleteUploadResponse(
            id=str(upload.pk), url=upload.public_url(), contentType=upload.content_type
        )
    )
