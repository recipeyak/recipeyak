from __future__ import annotations

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest


@endpoint()
def session_delete_all_view(request: AuthedHttpRequest, params: None) -> None:
    request.user.session_set.exclude(pk=request.session.session_key).delete()
