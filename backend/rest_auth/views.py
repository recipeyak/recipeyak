import logging
from django.conf import settings
from django.contrib.auth import (
    login,
    logout
)
from django.contrib.auth import get_user_model
from django.utils.decorators import method_decorator
from django.utils.translation import ugettext_lazy as _
from django.views.decorators.debug import sensitive_post_parameters

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import GenericAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny

from knox.models import AuthToken

from .app_settings import (
    UserDetailsSerializer, LoginSerializer,
    PasswordResetSerializer, PasswordResetConfirmSerializer,
    PasswordChangeSerializer
)

from .registration.serializers import (SocialLoginSerializer,
                                       SocialConnectSerializer,
                                       SocialAccountSerializer)

from allauth.account.adapter import get_adapter
from allauth.socialaccount.providers.github.views import GitHubOAuth2Adapter
from allauth.socialaccount.providers.gitlab.views import GitLabOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client

from allauth.socialaccount import signals
from allauth.socialaccount.models import SocialAccount
from allauth.socialaccount.adapter import get_adapter as get_social_adapter
from rest_framework.decorators import detail_route
from rest_framework.viewsets import GenericViewSet

sensitive_post_parameters_m = method_decorator(
    sensitive_post_parameters(
        'password', 'old_password', 'new_password1', 'new_password2'
    )
)

logger = logging.getLogger(__name__)


class LoginView(GenericAPIView):
    """
    Check the credentials and return the REST Token
    if the credentials are valid and authenticated.
    Calls Django Auth login method to register User ID
    in Django session framework

    Accept the following POST parameters: username, password
    Return the REST Framework Token Object's key.
    """
    permission_classes = (AllowAny,)
    serializer_class = LoginSerializer

    @sensitive_post_parameters_m
    def dispatch(self, *args, **kwargs):
        return super(LoginView, self).dispatch(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data,
            context={'request': request})

        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data.get('user')

        token = AuthToken.objects.create(user)

        login(request, user)
        logger.info(f'Login by {user}')

        return Response({
            'key': token,
            'user': UserDetailsSerializer(user).data
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    Calls Django logout method and delete the Token object
    assigned to the current User object.

    Accepts/Returns nothing.
    """
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        request._auth.delete()

        logger.info(f'Logout by {request.user}')
        logout(request)

        return Response({"detail": _("Successfully logged out.")},
                        status=status.HTTP_200_OK)

class UserDetailsView(RetrieveUpdateAPIView):
    """
    Reads and updates UserModel fields
    Accepts GET, PUT, PATCH methods.

    Default accepted fields: username, first_name, last_name
    Default display fields: pk, username, email, first_name, last_name
    Read-only fields: pk, email

    Returns UserModel fields.
    """
    serializer_class = UserDetailsSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def get_queryset(self):
        """
        Adding this method since it is sometimes called when using
        django-rest-swagger
        https://github.com/Tivix/django-rest-auth/issues/275
        """
        return get_user_model().objects.none()

    def delete(self, request, *args, **kwargs):
        if request.user.has_team():
            raise PermissionDenied(detail='you must leave all your teams to delete your account')
        request.user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


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
        logger.info(f'Password reset request by {request.user}')
        # Return the success message with OK HTTP status
        return Response(
            {"detail": _("Password reset e-mail has been sent.")},
            status=status.HTTP_200_OK
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

    @sensitive_post_parameters_m
    def dispatch(self, *args, **kwargs):
        return super(PasswordResetConfirmView, self).dispatch(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        logger.info(f'Password reset completed by {request.user}')
        return Response(
            {"detail": _("Password has been reset with the new password.")}
        )


class PasswordChangeView(GenericAPIView):
    """
    Calls Django Auth SetPasswordForm save method.

    Accepts the following POST parameters: new_password1, new_password2
    Returns the success/fail message.
    """
    serializer_class = PasswordChangeSerializer
    permission_classes = (IsAuthenticated,)

    @sensitive_post_parameters_m
    def dispatch(self, *args, **kwargs):
        return super(PasswordChangeView, self).dispatch(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        logger.info(f'Password changed by {request.user}')
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
        logger.info(f'Social login attempt by {self.user}')
        get_adapter(self.request).login(self.request, self.user)


class GithubLogin(SocialLoginView):
    adapter_class = GitHubOAuth2Adapter
    client_class = OAuth2Client
    callback_url = settings.SOCIALACCOUNT_PROVIDERS['github']['URL']


class GitlabLogin(SocialLoginView):
    adapter_class = GitLabOAuth2Adapter
    client_class = OAuth2Client
    callback_url = settings.SOCIALACCOUNT_PROVIDERS['gitlab']['URL']


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

    @detail_route(methods=['POST'])
    def disconnect(self, request, pk):
        """
        disconnect SocialAccount from remote service for the currently logged in user
        """
        accounts = self.get_queryset()
        account = accounts.get(pk=pk)
        get_social_adapter(self.request).validate_disconnect(account, accounts)
        account.delete()
        signals.social_account_removed.send(
            sender=SocialAccount,
            request=self.request,
            socialaccount=account
        )
        logger.info(f'Social Account disconnected for {request.user}')
        return Response(self.get_serializer(account).data)


class GithubConnect(SocialConnectView):
    adapter_class = GitHubOAuth2Adapter
    client_class = OAuth2Client
    callback_url = settings.SOCIALACCOUNT_PROVIDERS['github']['URL']


class GitlabConnect(SocialConnectView):
    adapter_class = GitLabOAuth2Adapter
    client_class = OAuth2Client
    callback_url = settings.SOCIALACCOUNT_PROVIDERS['gitlab']['URL'] + '/connect'
