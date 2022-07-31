from __future__ import annotations
import dataclasses
from typing import Any, Dict, cast

from rest_framework import serializers
from user_sessions.models import Session

from core import user_agent
from core.models import Team, User
from core.serialization import BaseModelSerializer


class UserSerializer(BaseModelSerializer):
    # we've renamed `recipe_team` in the backend, but to prevent breaking the
    # API we're preserving the API facing name.
    selected_team = serializers.PrimaryKeyRelatedField(
        source="recipe_team", queryset=Team.objects.all(), allow_null=True
    )
    name = serializers.CharField(allow_blank=True, allow_null=True)

    def to_representation(self, instance: User) -> dict[str, Any]:
        data = super().to_representation(instance)
        data["name"] = data.get("name") or data["email"]
        return data  # type: ignore [no-any-return]

    class Meta:
        model = User
        editable = False
        fields = (
            "id",
            "email",
            "name",
            "avatar_url",
            "has_usable_password",
            "dark_mode_enabled",
            "selected_team",
            "schedule_team",
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
        ua = obj.user_agent
        assert ua is not None
        return dataclasses.asdict(user_agent.parse(ua))

    def get_current(self, obj: Session) -> bool:
        return cast(bool, obj.pk == self.context["request"].session.session_key)
