import logging

from django.contrib.auth import login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.debug import sensitive_post_parameters
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.users.serializers import UserSerializer as UserDetailsSerializer

from .serializers import (
    LoginSerializer,
    PasswordChangeSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetSerializer,
)

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
            {"detail": "Successfully logged out."}, status=status.HTTP_200_OK
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
            {"detail": "Password reset e-mail has been sent."},
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
        return Response({"detail": "Password has been reset with the new password."})


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
        return Response({"detail": "New password has been saved."})
