from __future__ import annotations

from datetime import date
from typing import Literal

from django.db import connection
from typing_extensions import TypedDict

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse
from recipeyak.api.base.serialization import RequestParams
from recipeyak.api.unwrap import unwrap
from recipeyak.models import get_team


class CalendarNexOpenParams(RequestParams):
    day: Literal[
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Weekday",
        "Weekend",
    ]
    now: date


class CalendarResponse(TypedDict):
    date: date


@endpoint()
def calendar_next_open_view(
    request: AuthedHttpRequest[CalendarNexOpenParams]
) -> JsonResponse[CalendarResponse]:
    params = CalendarNexOpenParams.parse_obj(request.GET.dict())
    team_id = get_team(request.user).id
    with connection.cursor() as cursor:
        weekday = params.day
        now = params.now
        day_number = {
            "Sunday": (0,),
            "Monday": (1,),
            "Tuesday": (2,),
            "Wednesday": (3,),
            "Thursday": (4,),
            "Friday": (5,),
            "Saturday": (6,),
            "Weekday": (1, 2, 3, 4, 5),
            "Weekend": (0, 6),
        }[weekday]

        cursor.execute(
            """
SELECT
gen_date::date "date"
FROM
generate_series(%(now)s::date + '1 day'::interval, (%(now)s::date + '3 years'::interval), '1 day') "gen_date"
LEFT JOIN core_scheduledrecipe ON core_scheduledrecipe."on" = gen_date
AND team_id = %(team_id)s
WHERE
date_part('dow', gen_date) in %(day_number)s
AND id IS NULL
ORDER BY
gen_date ASC
LIMIT 1;
""",
            {"day_number": day_number, "team_id": team_id, "now": now.isoformat()},
        )
        (date,) = unwrap(cursor.fetchone())
        return JsonResponse({"date": date})
