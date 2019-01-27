from core.models import MyUser
from core.serialization import BaseModelSerializer
from user_sessions.models import Session
from typing import Optional, Dict, Any
from core import user_agent
from core.user_agent import Device
import dataclasses

from rest_framework import serializers


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

    def get_device(self, obj: Session) -> Dict[str, Any]:
        return dataclasses.asdict(user_agent.parse(obj.user_agent))

    def get_current(self, obj: Session) -> bool:
        return obj.pk == self.context["request"].session.session_key
