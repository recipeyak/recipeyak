from __future__ import annotations

from typing import Any

from rest_framework import serializers

from recipeyak.api.base.serialization import BaseModelSerializer
from recipeyak.models import User


class UserSerializer(BaseModelSerializer):
    name = serializers.CharField(allow_blank=True, allow_null=True)
    theme = serializers.CharField(allow_blank=True, allow_null=True, source="theme_day")

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
            "theme",
            "theme_day",
            "theme_night",
            "theme_mode",
            "schedule_team",
        )
