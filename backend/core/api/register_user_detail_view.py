import logging
from typing import Any, Dict, cast

from allauth.account import app_settings as allauth_settings
from allauth.account.adapter import get_adapter
from allauth.account.utils import complete_signup, setup_user_email

# Social Login
from allauth.socialaccount.models import EmailAddress
from allauth.utils import email_address_exists, get_username_max_length
from django.contrib.auth import get_user_model
from django.utils.decorators import method_decorator
from django.views.decorators.debug import sensitive_post_parameters
from rest_framework import serializers, status
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from core.api.serialization import BaseSerializer
from core.api.serializers.user import UserSerializer as UserDetailsSerializer

logger = logging.getLogger(__name__)


class RegisterSerializer(BaseSerializer):
    username = serializers.CharField(
        max_length=get_username_max_length(),
        min_length=allauth_settings.USERNAME_MIN_LENGTH,
        required=allauth_settings.USERNAME_REQUIRED,
    )
    email = serializers.EmailField(required=allauth_settings.EMAIL_REQUIRED)
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate_username(self, username):
        return get_adapter().clean_username(username)

    def validate_email(self, email):
        email = get_adapter().clean_email(email)
        if allauth_settings.UNIQUE_EMAIL:
            if email and email_address_exists(email):
                # Do we have an account already with this email address?
                user_account = (
                    cast(Any, get_user_model()).objects.filter(email=email).first()
                    or EmailAddress.objects.get(email=email).user
                )

                # see if we already have a social account
                social_account = user_account.socialaccount_set.first()
                if social_account:
                    # users need to login with existing social accounts and create a password
                    msg = f"A {social_account.provider.capitalize()} account is already associated with { email }. Login with that account instead and add a password to enable email/password login."
                else:
                    msg = f"An email/password account is already associated with { user_account.email }."
                raise serializers.ValidationError(msg)
        return email

    def validate_password1(self, password):
        return get_adapter().clean_password(password)

    def validate(self, data):
        if data["password1"] != data["password2"]:
            raise serializers.ValidationError("The two password fields didn't match.")
        return data

    def custom_signup(self, request, user):
        pass

    def get_cleaned_data(self):
        return {
            "username": self.validated_data.get("username", ""),
            "password1": self.validated_data.get("password1", ""),
            "email": self.validated_data.get("email", ""),
        }

    def save(self, request):
        adapter = get_adapter()
        user = adapter.new_user(request)
        self.cleaned_data = self.get_cleaned_data()
        adapter.save_user(request, user, self)
        self.custom_signup(request, user)
        setup_user_email(request, user, [])
        return user


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
