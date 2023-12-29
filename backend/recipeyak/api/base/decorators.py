from collections.abc import Callable
from functools import wraps
from typing import Any, Literal, Protocol, overload

from django.core.exceptions import PermissionDenied
from django.http import HttpResponse

from recipeyak.api.base.request import AnonymousHttpRequest, AuthedHttpRequest


class AuthedView(Protocol):
    def __call__(
        self, request: AuthedHttpRequest, *args: Any, **kwargs: Any
    ) -> HttpResponse:
        ...


class AnonView(Protocol):
    def __call__(
        self, request: AnonymousHttpRequest, *args: Any, **kwargs: Any
    ) -> HttpResponse:
        ...


class AnyView(Protocol):
    def __call__(self, request: Any, *args: Any, **kwargs: Any) -> HttpResponse:
        ...


@overload
def endpoint(
    *, dangerously_disable_auth_check: Literal[True]
) -> Callable[[AnonView], AnonView]:
    ...


@overload
def endpoint(
    *, dangerously_disable_auth_check: Literal[False] = False
) -> Callable[[AuthedView], AuthedView]:
    ...


def endpoint(
    *, dangerously_disable_auth_check: bool = False
) -> Callable[[AnyView], AnyView]:
    def decorator_func(func: AnyView) -> AnyView:
        @wraps(func)
        def wrapper(request: Any, *args: Any, **kwargs: Any) -> HttpResponse:
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
