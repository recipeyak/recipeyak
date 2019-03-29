import logging
from django.conf import settings
from django.contrib.auth import login, logout
from django.utils.decorators import method_decorator
from django.utils.translation import ugettext_lazy as _
from django.views.decorators.debug import sensitive_post_parameters

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny

from .serializers import (
    LoginSerializer,
    PasswordResetSerializer,
    PasswordResetConfirmSerializer,
    PasswordChangeSerializer,
)

from core.users.serializers import UserSerializer as UserDetailsSerializer


from .registration.serializers import (
    SocialLoginSerializer,
    SocialConnectSerializer,
    SocialAccountSerializer,
)

from allauth.account.adapter import get_adapter
from allauth.socialaccount.providers.github.views import GitHubOAuth2Adapter
from allauth.socialaccount.providers.gitlab.views import GitLabOAuth2Adapter
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client

from allauth.socialaccount import signals
from allauth.socialaccount.models import SocialAccount
from allauth.socialaccount.adapter import get_adapter as get_social_adapter
from rest_framework.decorators import action
from rest_framework.viewsets import GenericViewSet

logger = logging.getLogger(__name__)


class LoginView(GenericAPIView):
    """
    Check the credentials and login if credentials are valid and authenticated.
    Calls Django Auth login method to register User ID in Django session framework.

    Accept the following POST parameters: username, password
    """

    permission_classes = (AllowAny,)
    serializer_class = LoginSerializer

    @method_decorator(
        sensitive_post_parameters(
            "password", "old_password", "new_password1", "new_password2"
        )
    )
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data, context={"request": request}
        )

        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data.get("user")

        login(request, user)
        logger.info("Login by %s", user)

        return Response(
            {"user": UserDetailsSerializer(user).data}, status=status.HTTP_200_OK
        )


class LogoutView(APIView):
    """
    Calls Django logout method and logs out current User object.

    Accepts/Returns nothing.
    """

    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        logger.info("Logout by %s", request.user)
        logout(request)

        return Response(
            {"detail": _("Successfully logged out.")}, status=status.HTTP_200_OK
        )


class PasswordResetView(GenericAPIView):
    """
    Calls Django Auth PasswordResetForm save method.

    Accepts the following POST parameters: email
    Returns the success/fail message.
    """

    serializer_class = PasswordResetSerializer
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        # Create a serializer with request.data
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        serializer.save()
        logger.info("Password reset request by %s", request.user)
        # Return the success message with OK HTTP status
        return Response(
            {"detail": _("Password reset e-mail has been sent.")},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(GenericAPIView):
    """
    Password reset e-mail link is confirmed, therefore
    this resets the user's password.

    Accepts the following POST parameters: token, uid,
        new_password1, new_password2
    Returns the success/fail message.
    """

    serializer_class = PasswordResetConfirmSerializer
    permission_classes = (AllowAny,)

    @method_decorator(
        sensitive_post_parameters(
            "password", "old_password", "new_password1", "new_password2"
        )
    )
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        logger.info("Password reset completed by %s", request.user)
        return Response({"detail": _("Password has been reset with the new password.")})


class PasswordChangeView(GenericAPIView):
    """
    Calls Django Auth SetPasswordForm save method.

    Accepts the following POST parameters: new_password1, new_password2
    Returns the success/fail message.
    """

    serializer_class = PasswordChangeSerializer
    permission_classes = (IsAuthenticated,)

    @method_decorator(
        sensitive_post_parameters(
            "password", "old_password", "new_password1", "new_password2"
        )
    )
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        logger.info("Password changed by %s", request.user)
        return Response({"detail": _("New password has been saved.")})


class SocialLoginView(LoginView):
    """
    class used for social authentications
    example usage for facebook with access_token
    -------------
    from allauth.socialaccount.providers.facebook.views import FacebookOAuth2Adapter

    class FacebookLogin(SocialLoginView):
        adapter_class = FacebookOAuth2Adapter
    -------------

    example usage for facebook with code

    -------------
    from allauth.socialaccount.providers.facebook.views import FacebookOAuth2Adapter
    from allauth.socialaccount.providers.oauth2.client import OAuth2Client

    class FacebookLogin(SocialLoginView):
        adapter_class = FacebookOAuth2Adapter
         client_class = OAuth2Client
         callback_url = 'localhost:8000'
    -------------
    """

    serializer_class = SocialLoginSerializer

    def process_login(self):
        logger.info("Social login attempt by %s", self.user)
        get_adapter(self.request).login(self.request, self.user)


class GithubLogin(SocialLoginView):
    adapter_class = GitHubOAuth2Adapter
    client_class = OAuth2Client
    callback_url = settings.SOCIALACCOUNT_PROVIDERS["github"]["URL"]


class GitlabLogin(SocialLoginView):
    adapter_class = GitLabOAuth2Adapter
    client_class = OAuth2Client
    callback_url = settings.SOCIALACCOUNT_PROVIDERS["gitlab"]["URL"]


class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    callback_url = settings.SOCIALACCOUNT_PROVIDERS["google"]["URL"]


class SocialConnectView(SocialLoginView):
    """
    class used for social account linking
    example usage for facebook with access_token
    -------------
    from allauth.socialaccount.providers.facebook.views import FacebookOAuth2Adapter
    class FacebookConnect(SocialConnectView):
        adapter_class = FacebookOAuth2Adapter
    -------------
    """

    serializer_class = SocialConnectSerializer
    permission_classes = (IsAuthenticated,)


class SocialAccountViewSet(GenericViewSet):
    """
    allauth SocialAccount REST API read and disconnect views for logged in users
    Refer to the django-allauth package implementation of the models and
    account handling logic for more details, this viewset emulates the allauth web UI.
    """

    serializer_class = SocialAccountSerializer
    permission_classes = (IsAuthenticated,)
    queryset = SocialAccount.objects.none()

    def get_queryset(self):
        return SocialAccount.objects.filter(user=self.request.user)

    def list(self, request):
        """
        list SocialAccounts for the currently logged in user
        """
        return Response(self.get_serializer(self.get_queryset(), many=True).data)

    @action(detail=True, methods=["POST"])
    def disconnect(self, request, pk):
        """
        disconnect SocialAccount from remote service for the currently logged in user
        """
        accounts = self.get_queryset()
        account = accounts.get(pk=pk)
        get_social_adapter(self.request).validate_disconnect(account, accounts)
        account.delete()
        signals.social_account_removed.send(
            sender=SocialAccount, request=self.request, socialaccount=account
        )
        logger.info("Social Account disconnected for %s", request.user)
        return Response(self.get_serializer(account).data)


class GithubConnect(SocialConnectView):
    adapter_class = GitHubOAuth2Adapter
    client_class = OAuth2Client
    callback_url = settings.SOCIALACCOUNT_PROVIDERS["github"]["URL"]


class GitlabConnect(SocialConnectView):
    adapter_class = GitLabOAuth2Adapter
    client_class = OAuth2Client
    callback_url = settings.SOCIALACCOUNT_PROVIDERS["gitlab"]["URL"] + "/connect"


class GoogleConnect(SocialConnectView):
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    callback_url = settings.SOCIALACCOUNT_PROVIDERS["google"]["URL"] + "/connect"
