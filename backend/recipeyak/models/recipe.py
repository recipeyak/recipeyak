from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING

from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.db.models.manager import Manager

from recipeyak.models.base import CommonInfo
from recipeyak.models.ingredient import Ingredient
from recipeyak.models.scheduled_recipe import ScheduledRecipe
from recipeyak.models.section import Section
from recipeyak.models.step import Step

if TYPE_CHECKING:
    from django.db.models.manager import RelatedManager

    from recipeyak.models.note import Note
    from recipeyak.models.scrape import Scrape  # noqa: F401
    from recipeyak.models.team import Team
    from recipeyak.models.timeline_event import TimelineEvent
    from recipeyak.models.upload import Upload  # noqa: F401
    from recipeyak.models.user import User


class Recipe(CommonInfo):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    author = models.CharField(max_length=255, blank=True, null=True)
    source = models.CharField(max_length=255, blank=True, null=True)
    time = models.CharField(max_length=255, blank=True, null=True)
    servings = models.CharField(max_length=255, blank=True, null=True)

    team = models.ForeignKey["Team"]("Team", on_delete=models.CASCADE, null=True)
    team_id: int | None

    archived_at = models.DateTimeField(null=True)

    tags = ArrayField(
        base_field=models.TextField(),
        null=True,
        default=list,
        blank=True,
        help_text="Tags for organization recipes.",
    )
    scrape = models.ForeignKey["Scrape"]("Scrape", on_delete=models.SET_NULL, null=True)
    scrape_id: int | None
    primary_image = models.ForeignKey["Upload"](
        "Upload", related_name="+", on_delete=models.SET_NULL, null=True
    )
    primary_image_id: int
    objects = Manager["Recipe"]()

    class Meta:
        db_table = "core_recipe"

    def schedule(self, *, on: date, user: User, team: Team) -> ScheduledRecipe:
        calendar = user.pinned_calendar
        assert calendar is not None
        return ScheduledRecipe.objects.create_scheduled(
            recipe=self, on=on, user=user, team=team, calendar=calendar
        )

    notes: RelatedManager[Note]
    ingredient_set: RelatedManager[Ingredient]
    scheduledrecipe_set: RelatedManager[ScheduledRecipe]
    timelineevent_set: RelatedManager[TimelineEvent]
    section_set: RelatedManager[Section]
    step_set: RelatedManager[Step]
