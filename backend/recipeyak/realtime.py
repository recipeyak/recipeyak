import asyncio

from ably import AblyRest

from recipeyak.api.base.drf_json_renderer import JSONRenderer
from recipeyak.api.calendar_serialization import ScheduleRecipeSerializer
from recipeyak.config import ABLY_API_KEY


async def _publish_calendar_event_async(
    scheduled_recipe: ScheduleRecipeSerializer, team_id: int
) -> None:
    async with AblyRest(ABLY_API_KEY) as ably:
        channel = ably.channels[f"scheduled_recipe:{team_id}"]
        await channel.publish(
            "scheduled_recipe_updated", JSONRenderer().render(scheduled_recipe).decode()
        )


def publish_calendar_event(
    scheduled_recipe: ScheduleRecipeSerializer, team_id: int
) -> None:
    asyncio.run(_publish_calendar_event_async(scheduled_recipe, team_id))


async def _publish_calendar_event_delete_async(recipe_id: int, team_id: int) -> None:
    async with AblyRest(ABLY_API_KEY) as ably:
        channel = ably.channels[f"scheduled_recipe:{team_id}"]
        await channel.publish(
            "scheduled_recipe_delete",
            JSONRenderer().render({"recipeId": recipe_id}).decode(),
        )


def publish_calendar_event_deleted(*, recipe_id: int, team_id: int) -> None:
    asyncio.run(_publish_calendar_event_delete_async(recipe_id, team_id))


async def _publish_cook_checklist_async(
    recipe_id: int, team_id: int, ingredient_id: int, checked: bool
) -> None:
    async with AblyRest(ABLY_API_KEY) as ably:
        channel = ably.channels[f"cook_checklist:{team_id}:{recipe_id}"]
        await channel.publish(
            "checkmark_updated",
            JSONRenderer()
            .render({"ingredientId": ingredient_id, "checked": checked})
            .decode(),
        )


def publish_cook_checklist(
    *, recipe_id: int, team_id: int, ingredient_id: int, checked: bool
) -> None:
    asyncio.run(
        _publish_cook_checklist_async(recipe_id, team_id, ingredient_id, checked)
    )
