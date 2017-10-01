from django.conf.urls import url, include
from django.views.generic import TemplateView

from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

from .views import (
    RecipeViewSet,
    StepViewSet,
    TagViewSet,
    IngredientViewSet,
    CartViewSet)

router = DefaultRouter()
router.register(r'recipes', RecipeViewSet, base_name='recipes')
router.register(r'cart', CartViewSet, base_name='cart')

recipes_router = routers.NestedSimpleRouter(router, r'recipes', lookup='recipe')
recipes_router.register(r'steps', StepViewSet, base_name='recipe-step')
recipes_router.register(r'tags', TagViewSet, base_name='recipe-tag')
recipes_router.register(r'ingredients', IngredientViewSet, base_name='recipe-ingredient')

urlpatterns = [
    url(r'^password-reset/confirm/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',
        TemplateView.as_view(template_name="password_reset_confirm.html"),
        name='password_reset_confirm'),
    # django-rest-auth related urls
    url(r'^rest-auth/', include('rest_auth.urls')),
    url(r'^rest-auth/registration/', include('rest_auth.registration.urls')),

    url(r'', include(router.urls)),
    url(r'', include(recipes_router.urls)),
]
