from django.db.models import Q

from core.models.ingredient import Ingredient  # noqa: F401
from core.models.invite import Invite  # noqa: F401
from core.models.membership import Membership, get_random_ical_id  # noqa: F401
from core.models.note import Note  # noqa: F401
from core.models.recipe import Recipe  # noqa: F401
from core.models.recipe_change import ChangeType, RecipeChange  # noqa: F401
from core.models.scheduled_recipe import ScheduledRecipe  # noqa: F401
from core.models.section import Section  # noqa: F401
from core.models.shopping_list import ShoppingList  # noqa: F401
from core.models.step import Step  # noqa: F401
from core.models.team import Team  # noqa: F401
from core.models.timeline_event import TimelineEvent  # noqa: F401
from core.models.user import User  # noqa: F401
from core.models.upload import Upload  # noqa: F401
from core.models.note_upload import NoteUpload  # noqa: F401


def user_active_team_ids(user):
    return user.membership_set.filter(is_active=True).values_list("team")


def user_and_team_recipes(user: User):
    return Recipe.objects.filter(
        Q(owner_user=user) | Q(owner_team__in=user_active_team_ids(user))
    )
