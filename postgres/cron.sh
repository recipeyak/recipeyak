#!/usr/bin/env bash
set -o xtrace
set -o pipefail
set -o errexit
set -o nounset

# Note: getting cron script to see the env vars is a little tricky so we add
# them to a file and souce that in the crontab file.
# We filter out any vars that are 'readonly'.
declare -p | grep -Ev 'BASHOPTS|BASH_VERSINFO|EUID|PPID|SHELLOPTS|UID' > /var/container.env

cron -f
