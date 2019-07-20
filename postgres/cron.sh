#!/usr/bin/env bash

# Note: getting cron script to see the env vars is a little tricky so we add
# them to a file and souce that in the crontab file.
# We filter out any vars that are 'readonly'.
declare -p | grep -Ev 'BASHOPTS|BASH_VERSINFO|EUID|PPID|SHELLOPTS|UID' > /var/container.env

cron -f
