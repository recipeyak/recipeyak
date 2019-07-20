#!/usr/bin/env bash
set -o xtrace
set -o pipefail
set -o errexit
set -o nounset

# Note: getting cron script to see the env vars is a little tricky so we add
# them to a file and souce that in the crontab file.
# We filter out any vars that are 'readonly'.
declare -p | grep -Ev 'BASHOPTS|BASH_VERSINFO|EUID|PPID|SHELLOPTS|UID' > /var/container.env

echo "$PGDUMP_CRON_SCHEDULE /var/pgdump.sh > /proc/1/fd/1 2>/proc/1/fd/2" >> /var/spool/cron/crontabs/root

crontab /var/spool/cron/crontabs/root

cron -f
