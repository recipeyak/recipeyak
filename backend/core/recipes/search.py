from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVector


def search_recipe_queryset(recipe_queryset, query):
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
    return (
        recipe_queryset.annotate(rank=SearchRank(vector, SearchQuery(query)))
        .order_by("id", "-rank")
        .distinct("id")
    )
