from __future__ import annotations

from django.db import connection
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from recipeyak.api.base.request import AuthedRequest
from recipeyak.api.unwrap import unwrap
from recipeyak.models import get_team


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def next_open(request: AuthedRequest, team_id: int = -1) -> Response:
    team_id = get_team(request).id
    with connection.cursor() as cursor:
        weekday = request.query_params["day"]
        now = request.query_params["now"]
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
            {"day_number": day_number, "team_id": team_id, "now": now},
        )
        (date,) = unwrap(cursor.fetchone())
        return Response({"date": date})
