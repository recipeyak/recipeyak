from collections.abc import Callable
from functools import wraps
from typing import Any, Literal, Protocol, overload

from django.contrib.auth.views import redirect_to_login as redirect_to_login_url
from django.http import HttpResponse

from recipeyak.api.base.request import AnonymousHttpRequest, AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse


class AuthedView(Protocol):
    def __call__(
        self, request: AuthedHttpRequest[Any], *args: Any, **kwargs: Any
    ) -> HttpResponse:
        ...

    @property
    def __name__(self) -> str:
        ...


class AnonView(Protocol):
    def __call__(
        self, request: AnonymousHttpRequest[Any], *args: Any, **kwargs: Any
    ) -> HttpResponse:
        ...

    @property
    def __name__(self) -> str:
        ...


class AnyView(Protocol):
    def __call__(self, request: Any, *args: Any, **kwargs: Any) -> HttpResponse:
        ...

    @property
    def __name__(self) -> str:
        ...


@overload
def endpoint(
    *, auth_required: Literal[False], redirect_to_login: bool = ...
) -> Callable[[AnonView], AnonView]:
    ...


@overload
def endpoint(
    *, auth_required: Literal[True] = ..., redirect_to_login: bool = ...
) -> Callable[[AuthedView], AuthedView]:
    ...


def endpoint(
    *, auth_required: bool = True, redirect_to_login: bool = False
) -> Callable[[AnyView], AnyView]:
    def decorator_func(func: AnyView) -> AnyView:
        @wraps(func)
        def wrapper(request: Any, *args: Any, **kwargs: Any) -> HttpResponse:
            if auth_required and not request.user.is_authenticated:
                if redirect_to_login:
                    return redirect_to_login_url(
                        request.get_full_path(), login_url="/login/"
                    )
                # TODO: figure out how we want to do this when the content type isn't json
                # Seems like anytime we don't have a json response, we want to redirect to login
                return JsonResponse(
                    {"detail": "Authentication credentials were not provided."},
                    status=403,
                )
            return func(request, *args, **kwargs)

        return wrapper

    return decorator_func
