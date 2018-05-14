from django.conf.urls import url, include

from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

from .views import (
    RecipeViewSet,
    StepViewSet,
    IngredientViewSet,
    ShoppingListView,
    UserStats,
    TeamViewSet,
    MembershipViewSet,
    TeamInviteViewSet,
    TeamRecipesViewSet,
    UserInvitesViewSet,
    ReportBadMerge,
    CalendarViewSet,
)

router = DefaultRouter()
router.register(r'recipes', RecipeViewSet, base_name='recipes')
router.register(r't', TeamViewSet, base_name='teams')
router.register(r'invites', UserInvitesViewSet, base_name='user-invites')
router.register(r'calendar', CalendarViewSet, base_name='calendar')

recipes_router = routers.NestedSimpleRouter(router, r'recipes', lookup='recipe')
recipes_router.register(r'steps', StepViewSet, base_name='recipe-step')
recipes_router.register(r'ingredients', IngredientViewSet, base_name='recipe-ingredient')

teams_router = routers.NestedSimpleRouter(router, r't', lookup='team')
teams_router.register(r'members', MembershipViewSet, base_name='team-member')
teams_router.register(r'invites', TeamInviteViewSet, base_name='team-invites')
teams_router.register(r'recipes', TeamRecipesViewSet, base_name='team-recipes')

urlpatterns = [
    # django-rest-auth related urls
    url(r'^rest-auth/', include('rest_auth.urls')),
    url(r'^rest-auth/registration/', include('rest_auth.registration.urls')),

    url(r'', include(router.urls)),
    url(r'', include(recipes_router.urls)),
    url(r'', include(teams_router.urls)),
    url(r'shoppinglist', ShoppingListView.as_view(), name='shopping-list'),
    url(r'user_stats', UserStats.as_view(), name='user-stats'),
    url(r'report-bad-merge', ReportBadMerge.as_view(), name='report-bad-merge'),
]
