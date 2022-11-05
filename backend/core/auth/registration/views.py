import logging
from typing import Any, Dict

from allauth.account import app_settings as allauth_settings
from allauth.account.utils import complete_signup
from django.utils.decorators import method_decorator
from django.views.decorators.debug import sensitive_post_parameters
from rest_framework import status
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from core.auth.registration.serializers import RegisterSerializer
from core.views.serializers.user import UserSerializer as UserDetailsSerializer

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
            data: Dict[str, Any] = {"detail": "Verification e-mail sent."}
        else:
            data = {"user": UserDetailsSerializer(user).data}

        headers = self.get_success_headers(serializer.data)
        logger.info("User registration: %s", user)

        return Response(data, status=status.HTTP_201_CREATED, headers=headers)
