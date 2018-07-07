import pytest

from core.models import Recipe, Step
from .search import search_recipe_queryset

pytestmark = pytest.mark.django_db


def test_search_queryset(client, recipe_pie, recipes, user):
    # create recipe with multiple components that can be queried
    # (if we don't get distinct recipes, this recipe will appear twice)
    recipe = Recipe.objects.create(name="blah", owner=user)
    Step.objects.create(text="blah blah blah", recipe=recipe, position=1.0)
    Step.objects.create(text="blah blah blah2", recipe=recipe, position=1.3)

    results = search_recipe_queryset(Recipe.objects.all(), "blah")

    assert len(results) <= Recipe.objects.count(), \
        "we should have at most as many recipes as exist in the database as a result"

    count = 0
    for r in results:
        if r.id == recipe.id:
            count += 1
    assert count == 1, \
        "our example recipe shouldn't be duplicated in results"

    assert results.first().id == recipe.id

    assert search_recipe_queryset(Recipe.objects.all(), "Pie").first().id == recipe_pie.id
