from functools import cache

import boto3
from botocore.client import Config
from mypy_boto3_s3 import S3Client

from recipeyak import config


@cache
def s3() -> S3Client:
    return boto3.client(
        "s3",
        config=Config(signature_version="s3v4"),
        aws_access_key_id=config.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=config.AWS_SECRET_ACCESS_KEY,
    )
