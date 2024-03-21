import typing
from collections.abc import Callable
from functools import wraps
from typing import Any, Generic, Literal, Protocol, TypeVar, cast, overload

from django.contrib.auth.views import redirect_to_login as redirect_to_login_url
from django.http import HttpResponse

from recipeyak.api.base.exceptions import APIError, RequestValidationError
from recipeyak.api.base.json import json_loads
from recipeyak.api.base.request import AnonymousHttpRequest, AuthedHttpRequest
from recipeyak.api.base.serialization import RequestParams

_P = TypeVar("_P", bound="RequestParams | None", contravariant=True)


class AuthedView(Protocol, Generic[_P]):
    def __call__(self, request: AuthedHttpRequest, params: _P) -> HttpResponse:
        ...

    @property
    def __name__(self) -> str:
        ...


class AnonView(Protocol, Generic[_P]):
    def __call__(self, request: AnonymousHttpRequest, params: _P) -> HttpResponse:
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
                raise APIError(
                    code="not_authenticated",
                    message="Authentication credentials were not provided.",
                    status=403,
                )

            params = _parse_param_data(request, func, kwargs)
            return func(request, params)

        return wrapper

    return decorator_func


def _parse_param_data(
    request: Any, func: AnyView, kwargs: dict[str, Any]
) -> RequestParams | None:
    param_type = typing.get_type_hints(func)["params"]
    if param_type is type(None):
        return None
    request_params = {}
    if request.method == "GET":
        request_params = request.GET.dict()
    elif (
        request.method == "POST" or request.method == "PATCH" or request.method == "PUT"
    ):
        if request.body:
            request_params = json_loads(request.body)
    elif request.method == "HEAD" or request.method == "DELETE":
        # don't need to do anything with these
        pass
    else:
        raise Exception(f"unexpected request method: {request.method}")

    for key in kwargs:
        if key in request_params:
            raise RequestValidationError(
                [
                    {
                        "type": "unexpected_param",
                        "msg": f"Unexpected parameter. param: {key}",
                        "input": None,
                        "loc": (),
                    }
                ]
            )
    request_params |= kwargs
    return cast(RequestParams, param_type).parse_obj(request_params)
