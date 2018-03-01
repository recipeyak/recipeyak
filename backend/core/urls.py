from django.conf.urls import url, include

from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

from .views import (
    RecipeViewSet,
    StepViewSet,
    TagViewSet,
    IngredientViewSet,
    CartViewSet,
    ShoppingListView,
    UserStats,
    ClearCart,
    TeamViewSet,
    MembershipViewSet,
    InviteViewSet,
    TeamRecipesViewSet,
)

router = DefaultRouter()
router.register(r'recipes', RecipeViewSet, base_name='recipes')
router.register(r'cart', CartViewSet, base_name='cart')
router.register(r't', TeamViewSet, base_name='teams')

recipes_router = routers.NestedSimpleRouter(router, r'recipes', lookup='recipe')
recipes_router.register(r'steps', StepViewSet, base_name='recipe-step')
recipes_router.register(r'tags', TagViewSet, base_name='recipe-tag')
recipes_router.register(r'ingredients', IngredientViewSet, base_name='recipe-ingredient')

teams_router = routers.NestedSimpleRouter(router, r't', lookup='team')
teams_router.register(r'members', MembershipViewSet, base_name='team-member')
teams_router.register(r'invites', InviteViewSet, base_name='team-invites')
teams_router.register(r'recipes', TeamRecipesViewSet, base_name='team-recipes')

urlpatterns = [
    # django-rest-auth related urls
    url(r'^rest-auth/', include('rest_auth.urls')),
    url(r'^rest-auth/registration/', include('rest_auth.registration.urls')),

    url(r'', include(router.urls)),
    url(r'', include(recipes_router.urls)),
    url(r'', include(teams_router.urls)),
    url(r'clear_cart', ClearCart.as_view()),
    url(r'shoppinglist', ShoppingListView.as_view()),
    url(r'user_stats', UserStats.as_view()),
]
