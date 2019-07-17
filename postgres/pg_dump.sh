#!/usr/bin/env sh

pg_dump "$POSTGRES_DB_NAME" | gzip | aws s3 cp - "s3://$POSTGRES_BACKUP_S3_BUCKET/backup-$(date '+%Y-%m-%d-%H-%M-%S')"
