from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVector
from django.db.models.aggregates import Max
from core.models import Recipe


def search_recipe_queryset(recipe_queryset, query, limit=10):
    """
    Search across Recipe
    - name
    - author
    - ingredient_name
    - ingredient_description
    - step_text
    """
    vector = (
        SearchVector("name", "author", weight="A")
        + SearchVector("step__text", weight="B")
        + SearchVector("ingredient__name", "ingredient__description", weight="C")
    )
    search_ids = (
        recipe_queryset
        .annotate(rank=SearchRank(vector, SearchQuery(query)), max_rank=Max('rank'))
        .order_by("-max_rank")
        .values_list('id', flat=True)[:limit]
    )
    recipes = Recipe.objects.filter(id__in=search_ids)

    # preserve the ordering from the search query
    ordered = []
    for recipe_id in list(dict.fromkeys(search_ids)):
        ordered.append(recipes.get(id=recipe_id))
    return ordered
