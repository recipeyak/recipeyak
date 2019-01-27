from django.urls import path

from core.users import views as v

urlpatterns = [
    path("user/", v.UserDetailsView.as_view(), name="rest_user_details"),
    path("sessions/", v.sessions, name="sessions-list"),
    path("sessions/<str:pk>/", v.sessions_detail, name="sessions-detail"),
]
