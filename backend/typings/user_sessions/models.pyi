from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from django.db import models
from user_sessions.backends.db import SessionStore

class SessionManager(models.Manager["Session"]):
    use_in_migrations = True
    def encode(self, session_dict: Any) -> Any: ...
    def save(
        self, session_key: Any, session_dict: Any, expire_date: datetime
    ) -> Session: ...

class Session(models.Model):
    session_key: models.CharField[str]
    session_data: models.TextField[str]
    expire_date: models.DateTimeField[datetime]
    objects: SessionManager

    class Meta:
        verbose_name = "session"
        verbose_name_plural = "sessions"
    def get_decoded(self) -> SessionStore: ...
    user: models.ForeignKey[Any]
    user_agent: models.CharField[Optional[str]]
    last_activity: models.DateTimeField[datetime]
    ip: models.GenericIPAddressField[Optional[str]]
