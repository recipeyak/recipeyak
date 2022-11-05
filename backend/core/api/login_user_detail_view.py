import logging

from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import SetPasswordForm
from django.utils.decorators import method_decorator
from django.views.decorators.debug import sensitive_post_parameters
from rest_framework import exceptions, serializers, status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.api.serializers.user import UserSerializer as UserDetailsSerializer
from core.models import User
from core.serialization import BaseSerializer

logger = logging.getLogger(__name__)


class LoginSerializer(BaseSerializer):
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(style={"input_type": "password"})

    def _validate_email(self, email, password):
        user = None

        if email and password:
            user = authenticate(email=email, password=password)
        else:
            msg = 'Must include "email" and "password".'
            raise exceptions.ValidationError(msg)

        return user

    def _validate_username(self, username, password):
        user = None

        if username and password:
            user = authenticate(username=username, password=password)
        else:
            msg = 'Must include "username" and "password".'
            raise exceptions.ValidationError(msg)

        return user

    def _validate_username_email(self, username, email, password):
        user = None

        if email and password:
            user = authenticate(email=email, password=password)
        elif username and password:
            user = authenticate(username=username, password=password)
        else:
            msg = 'Must include either "username" or "email" and "password".'
            raise exceptions.ValidationError(msg)

        return user

    def validate(self, attrs):
        username = attrs.get("username")
        email = attrs.get("email")
        password = attrs.get("password")

        user = None

        if "allauth" in settings.INSTALLED_APPS:
            from allauth.account import app_settings

            # Authentication through email
            if (
                app_settings.AUTHENTICATION_METHOD
                == app_settings.AuthenticationMethod.EMAIL
            ):
                user = self._validate_email(email, password)

            # Authentication through username
            elif (
                app_settings.AUTHENTICATION_METHOD
                == app_settings.AuthenticationMethod.USERNAME
            ):
                user = self._validate_username(username, password)

            # Authentication through either username or email
            else:
                user = self._validate_username_email(username, email, password)

        else:
            # Authentication without using allauth
            if email:
                try:
                    username = User.objects.get(email__iexact=email).get_username()
                except User.DoesNotExist:
                    pass

            if username:
                user = self._validate_username_email(username, "", password)

        # Did we get back an active user?
        if user:
            if not user.is_active:
                msg = "User account is disabled."
                raise exceptions.ValidationError(msg)
        else:
            msg = "Unable to log in with provided credentials."
            raise exceptions.ValidationError(msg)

        from allauth.account import app_settings

        if (
            app_settings.EMAIL_VERIFICATION
            == app_settings.EmailVerificationMethod.MANDATORY
        ):
            email_address = user.emailaddress_set.get(email=user.email)
            if not email_address.verified:
                raise serializers.ValidationError("E-mail is not verified.")

        attrs["user"] = user
        return attrs


class PasswordChangeSerializer(BaseSerializer):
    old_password = serializers.CharField(max_length=128)
    new_password1 = serializers.CharField(max_length=128)
    new_password2 = serializers.CharField(max_length=128)

    set_password_form_class = SetPasswordForm

    def __init__(self, *args, **kwargs):
        self.old_password_field_enabled = getattr(
            settings, "OLD_PASSWORD_FIELD_ENABLED", False
        )
        self.logout_on_password_change = getattr(
            settings, "LOGOUT_ON_PASSWORD_CHANGE", False
        )
        super().__init__(*args, **kwargs)

        self.request = self.context.get("request")
        self.user = getattr(self.request, "user", None)

        # https://github.com/Tivix/django-rest-auth/pull/359/files#diff-db982e2e05c8f35e6a68be80eee86c44R245
        if not self.old_password_field_enabled or not self.user.has_usable_password():
            self.fields.pop("old_password")

    def validate_old_password(self, value):
        invalid_password_conditions = (
            self.old_password_field_enabled,
            self.user,
            not self.user.check_password(value),
        )

        if all(invalid_password_conditions):
            raise serializers.ValidationError("Invalid password")
        return value

    def validate(self, attrs):
        self.set_password_form = self.set_password_form_class(
            user=self.user, data=attrs
        )

        if not self.set_password_form.is_valid():
            raise serializers.ValidationError(self.set_password_form.errors)
        return attrs

    def save(self):
        self.set_password_form.save()
        if not self.logout_on_password_change:
            from django.contrib.auth import update_session_auth_hash

            assert self.request is not None
            update_session_auth_hash(self.request, self.user)


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
