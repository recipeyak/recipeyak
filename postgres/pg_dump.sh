#!/usr/bin/env bash
set -o xtrace
set -o pipefail
set -o errexit
set -o nounset

pg_dump "$POSTGRES_DB_NAME" \
  -h "$POSTGRES_HOST_NAME" \
  -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USERNAME" \
  | gzip \
  | aws s3 cp - "s3://$POSTGRES_BACKUP_S3_BUCKET/$(date -u +"%Y-%m-%dT%H:%M:%SZ")-db.sql.gz"
