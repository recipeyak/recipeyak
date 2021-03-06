import logging
from typing import Any, Dict

from allauth.account import app_settings as allauth_settings
from allauth.account.utils import complete_signup
from allauth.account.views import ConfirmEmailView
from allauth.socialaccount import signals
from allauth.socialaccount.adapter import get_adapter as get_social_adapter
from allauth.socialaccount.models import SocialAccount
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.utils.translation import ugettext_lazy as _
from django.views.decorators.debug import sensitive_post_parameters
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import CreateAPIView, GenericAPIView, ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.users.serializers import UserSerializer as UserDetailsSerializer

from .serializers import (
    RegisterSerializer,
    SocialAccountSerializer,
    SocialConnectSerializer,
    VerifyEmailSerializer,
)

logger = logging.getLogger(__name__)

# TODO(chdsbd): Add tests


class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)

    @method_decorator(sensitive_post_parameters("password1", "password2"))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save(request=self.request)

        complete_signup(
            self.request._request, user, allauth_settings.EMAIL_VERIFICATION, None
        )

        if (
            allauth_settings.EMAIL_VERIFICATION
            == allauth_settings.EmailVerificationMethod.MANDATORY
        ):
            data: Dict[str, Any] = {"detail": _("Verification e-mail sent.")}
        else:
            data = {"user": UserDetailsSerializer(user).data}

        headers = self.get_success_headers(serializer.data)
        logger.info("User registration: %s", user)

        return Response(data, status=status.HTTP_201_CREATED, headers=headers)


class VerifyEmailView(APIView, ConfirmEmailView):
    permission_classes = (AllowAny,)
    allowed_methods = ("POST", "OPTIONS", "HEAD")

    def get_serializer(self, *args, **kwargs):
        return VerifyEmailSerializer(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.kwargs["key"] = serializer.validated_data["key"]
        confirmation = self.get_object()
        confirmation.confirm(self.request)
        logger.info("Email verified: %s", confirmation.email_address.email)
        return Response({"detail": _("ok")}, status=status.HTTP_200_OK)


class SocialAccountListView(ListAPIView):
    """
    List SocialAccounts for the currently logged in user
    """

    serializer_class = SocialAccountSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return SocialAccount.objects.filter(user=self.request.user)


class SocialAccountDisconnectView(GenericAPIView):
    """
    Disconnect SocialAccount from remote service for
    the currently logged in user
    """

    serializer_class = SocialConnectSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return SocialAccount.objects.filter(user=self.request.user)

    def post(self, request, provider: str):
        accounts = self.get_queryset()
        account = get_object_or_404(accounts, provider=provider)

        try:
            get_social_adapter(self.request).validate_disconnect(account, accounts)
        except ValidationError as e:
            raise PermissionDenied(detail=e.args[0])

        logger.info("Social account disconnected: %s", account)
        account.delete()
        signals.social_account_removed.send(
            sender=SocialAccount, request=self.request, socialaccount=account
        )
        return Response(SocialAccountSerializer(self.get_queryset(), many=True).data)
