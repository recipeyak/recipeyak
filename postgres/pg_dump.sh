#!/usr/bin/env sh

pg_dump > /proc/1/fd/1 2>/proc/1/fd/2
