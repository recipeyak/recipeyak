#!/usr/bin/env sh
set -eux

PYTHONUNBUFFERED=1 exec /var/app/.venv/bin/gunicorn -w 3 -b 0.0.0.0:8000 recipeyak.api.base.wsgi --access-logfile - --error-logfile - --capture-output --enable-stdio-inheritance --access-logformat 'request="%(r)s" request_time=%(L)s remote_addr="%(h)s" request_id=%({X-Request-Id}i)s response_id=%({X-Response-Id}i)s method=%(m)s protocol=%(H)s status_code=%(s)s response_length=%(b)s referer="%(f)s" process_id=%(p)s user_agent="%(a)s"'
