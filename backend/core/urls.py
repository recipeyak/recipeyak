from django.conf.urls import url, include

from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

from .views import RecipeViewSet, StepViewSet, TagViewSet, IngredientViewSet

router = DefaultRouter()
router.register(r'recipes', RecipeViewSet, base_name='recipes')

recipes_router = routers.NestedSimpleRouter(router, r'recipes', lookup='recipe')
recipes_router.register(r'steps', StepViewSet, base_name='recipe-step')
recipes_router.register(r'tags', TagViewSet, base_name='recipe-tag')
recipes_router.register(r'ingredients', IngredientViewSet, base_name='recipe-ingredient')

urlpatterns = [
    # django-rest-auth related urls
    url(r'^rest-auth/', include('rest_auth.urls')),
    url(r'^rest-auth/registration/', include('rest_auth.registration.urls')),

    url(r'', include(router.urls)),
    url(r'', include(recipes_router.urls)),
]
