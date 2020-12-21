from __future__ import annotations

from datetime import datetime
from typing import Any

from django.db import models

from core.models import MyUser


class SessionManager(models.Manager["Session"]):
    use_in_migrations = True
    def encode(self, session_dict: Any) -> Any: ...
    def save(
        self, session_key: Any, session_dict: Any, expire_date: datetime
    ) -> Session: ...

class Session(models.Model):

    session_key = models.CharField(
        verbose_name="session key", max_length=40, primary_key=True
    )
    session_data = models.TextField(verbose_name="session data")
    expire_date = models.DateTimeField(verbose_name="expiry date", db_index=True)
    objects = SessionManager()
    class Meta:
        verbose_name = "session"
        verbose_name_plural = "sessions"
    def get_decoded(self) -> SessionStore: ...
    user = models.ForeignKey(MyUser, null=True, on_delete=models.CASCADE)
    user_agent = models.CharField(null=True, blank=True, max_length=200)
    last_activity = models.DateTimeField(auto_now=True)
    ip = models.GenericIPAddressField(null=True, blank=True, verbose_name="IP")

# At bottom to avoid circular import
from .backends.db import SessionStore  # noqa: E402 isort:skip
