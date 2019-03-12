from django.conf.urls import url
from django.urls import path

from .views import (
    LoginView,
    LogoutView,
    PasswordChangeView,
    PasswordResetView,
    PasswordResetConfirmView,
    GithubLogin,
    GitlabLogin,
    GoogleLogin,
    GithubConnect,
    GitlabConnect,
    GoogleConnect,
)

from .registration.views import SocialAccountListView, SocialAccountDisconnectView

urlpatterns = [
    # URLs that do not require a session or valid token
    url(r"^password/reset/$", PasswordResetView.as_view(), name="rest_password_reset"),
    url(
        r"^password/reset/confirm/$",
        PasswordResetConfirmView.as_view(),
        name="rest_password_reset_confirm",
    ),
    url(r"^login/$", LoginView.as_view(), name="rest_login"),
    # URLs that require a user to be logged in with a valid session / token.
    url(r"^logout/$", LogoutView.as_view(), name="rest_logout"),
    url(
        r"^password/change/$", PasswordChangeView.as_view(), name="rest_password_change"
    ),
    # TODO
    # - do oauth login all on backend
    # - make oauth configuration more generic so it's easier to add new providers
    # - make it easy to add oauth providers to the connect page
    url(r"^github/$", GithubLogin.as_view(), name="github_login"),
    url(r"^github/connect/$", GithubConnect.as_view(), name="github_connect"),
    url(r"^gitlab/$", GitlabLogin.as_view(), name="gitlab_login"),
    url(r"^gitlab/connect/$", GitlabConnect.as_view(), name="gitlab_connect"),
    url(r"^google/$", GoogleLogin.as_view(), name="google_login"),
    url(r"^google/connect/$", GoogleConnect.as_view(), name="google_connect"),
    url(
        r"^socialaccounts/$",
        SocialAccountListView.as_view(),
        name="social_account_list",
    ),
    path(
        "socialaccounts/<str:provider>/disconnect/",
        SocialAccountDisconnectView.as_view(),
        name="social_account_disconnect",
    ),
]
