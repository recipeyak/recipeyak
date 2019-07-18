#!/usr/bin/env bash
set -o xtrace
set -o pipefail
set -o errexit
set -o nounset

pg_dump "$POSTGRES_DB_NAME" | gzip | aws s3 cp - "s3://$POSTGRES_BACKUP_S3_BUCKET/backup-$(date '+%Y-%m-%d-%H-%M-%S')"
