from django.urls import path

import core.schedule.views

urlpatterns = [
    path(
        r"api/v1/calendar-presence/<team_pk>",
        core.schedule.views.presence,
        name="calendar-presence",
    )
]
