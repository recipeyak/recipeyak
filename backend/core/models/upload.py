from typing import TYPE_CHECKING

import boto3
from botocore.client import Config
from django.db import models

from core import config
from core.models.base import CommonInfo

if TYPE_CHECKING:
    from core.models import User, Note  # noqa: F401

s3 = boto3.client(
    "s3",
    config=Config(signature_version="s3v4"),
    aws_access_key_id=config.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=config.AWS_SECRET_ACCESS_KEY,
)


class Upload(CommonInfo):
    created_by = models.ForeignKey["User"](
        "User", related_name="uploads", on_delete=models.PROTECT
    )
    bucket = models.TextField()
    key = models.TextField()
    completed = models.BooleanField(default=False)

    note = models.ForeignKey["Note"](
        "Note", related_name="uploads", null=True, on_delete=models.SET_NULL
    )

    if TYPE_CHECKING:
        note_id: int | None

    def public_url(self) -> str:
        return s3.generate_presigned_url(
            ClientMethod="get_object",
            Params={"Bucket": self.bucket, "Key": self.key},
        )
