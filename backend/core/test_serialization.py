import pytest
from core.models import Recipe
from core.serialization import UnexpectedDatabaseAccess
from core.recipes.serializers import RecipeSerializer


@pytest.mark.django_db
def test_db_blocker_warn_still_calls_db(settings, recipe) -> None:
    """
    Shouldn't fail, but still fetch from database with a warning logged
    """
    settings.ERROR_ON_SERIALIZER_DB_ACCESS = False
    queryset = Recipe.objects.all()

    assert len(RecipeSerializer(queryset, many=True).data) > 0


@pytest.mark.django_db
def test_db_blocker_fails_with_proper_settings(settings, recipe) -> None:
    """
    When the proper config setting is specified, database access should raise
    an exception inside a serializer.
    """
    settings.ERROR_ON_SERIALIZER_DB_ACCESS = True
    queryset = Recipe.objects.all()

    with pytest.raises(UnexpectedDatabaseAccess):
        RecipeSerializer(queryset, many=True).data
