from django.conf.urls import url

from .views import export_recipes

urlpatterns = [
    url(r'^recipes.(?P<filetype>json|yaml|yml)$', export_recipes, name='export-recipes'),
    url(r'^recipes/(?P<id>[0-9]+).*\.(?P<filetype>json|yaml|yml)$', export_recipes, name='export-recipe'),
]
