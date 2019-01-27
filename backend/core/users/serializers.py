from core.models import MyUser
from core.serialization import BaseModelSerializer
from user_sessions.models import Session

from rest_framework import serializers
from user_sessions.templatetags.user_sessions import device


class UserSerializer(BaseModelSerializer):
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


class SessionSerializer(BaseModelSerializer):
    id = serializers.CharField(source="pk")

    device = serializers.SerializerMethodField()

    current = serializers.SerializerMethodField()

    class Meta:
        model = Session
        editable = False
        fields = ("id", "device", "current", "last_activity", "ip")

    def get_device(self, obj: Session) -> str:
        return device(obj.user_agent)

    def get_current(self, obj: Session) -> bool:
        return obj.pk == self.context["request"].session.session_key
