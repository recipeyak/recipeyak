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
        # to use distinct on id, we need to order by id first
        # (this is an SQL requirement, not a Django issue)
        # We order by rank to actually sort the results
        .order_by("id", "-rank")
        .distinct("id")
    )
