import pytest

from core.models import Recipe
from core.search import search_recipe_queryset

pytestmark = pytest.mark.django_db


def test_search_queryset(client, recipes):
    """This is a sanity check that the search endpoint returns."""
    results = search_recipe_queryset(Recipe.objects.all(), "test")
    assert len(results) > 0
