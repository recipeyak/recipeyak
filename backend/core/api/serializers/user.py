from __future__ import annotations

from typing import Any

from rest_framework import serializers

from core.api.serialization import BaseModelSerializer
from core.models import User


class UserSerializer(BaseModelSerializer):
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
            "schedule_team",
        )
