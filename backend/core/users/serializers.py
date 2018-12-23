from rest_framework import serializers

from core.models import MyUser


class UserSerializer(serializers.ModelSerializer):
    """serializer custom user model"""

    class Meta:
        model = MyUser
        editable = False
        fields = (
            "id",
            "email",
            "avatar_url",
            "has_usable_password",
            "dark_mode_enabled",
            "selected_team",
        )
