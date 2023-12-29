from collections.abc import Callable
from functools import wraps
from typing import Any, TypeVar

from django.core.exceptions import PermissionDenied

_ResponseType = TypeVar("_ResponseType")


def endpoint(
    *, dangerously_disable_auth_check: bool = False
) -> Callable[[Callable[..., _ResponseType]], Callable[..., _ResponseType]]:
    def decorator_func(
        func: Callable[..., _ResponseType]
    ) -> Callable[..., _ResponseType]:
        @wraps(func)
        def wrapper(request: Any, *args: Any, **kwargs: Any) -> _ResponseType:
            # TODO: maybe we don't need *args
            if dangerously_disable_auth_check:
                passed_auth = True
            else:
                passed_auth = request.user.is_authenticated
            if not passed_auth:
                raise PermissionDenied("Authentication failed")
            return func(request, *args, **kwargs)

        return wrapper

    return decorator_func
