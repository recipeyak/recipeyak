from collections import defaultdict
from collections.abc import Sequence
from dataclasses import dataclass
from typing import Any, Literal, Protocol

from django.http import HttpRequest, HttpResponse, HttpResponseNotAllowed
from django.urls import URLPattern, path, re_path

Method = Literal["get", "post", "patch", "delete", "head"]


class View(Protocol):
    def __call__(self, request: Any, *args: Any, **kwargs: Any) -> HttpResponse:
        ...

    @property
    def __name__(self) -> str:
        ...


@dataclass(frozen=True, slots=True)
class Route:
    path: str
    method: Method | Sequence[Method]
    view: View
    regex: bool


def _method_router(
    request: HttpRequest,
    *args: Any,
    method_to_view: dict[str, View],
    **kwargs: dict[str, Any],
) -> HttpResponse:
    view = (
        method_to_view.get(request.method.lower())
        if request.method is not None
        else None
    )
    if view is None:
        return HttpResponseNotAllowed(method_to_view.keys())
    return view(request, *args, **kwargs)


def create_urlpatterns(*routes: Route) -> list[URLPattern]:
    path_to_routes = defaultdict[str, list[Route]](list)
    for route in routes:
        path_to_routes[route.path].append(route)

    urlpatterns = list[URLPattern]()
    for p, views in path_to_routes.items():
        method_to_view = dict[str, View]()
        is_regex = False
        for view in views:
            if isinstance(view.method, str):
                method_to_view[view.method] = view.view
            else:
                for method in view.method:
                    method_to_view[method] = view.view
            is_regex = is_regex or view.regex

        create_path = path if not is_regex else re_path
        urlpatterns.append(
            create_path(
                p,
                lambda request,
                *args,
                method_to_view=method_to_view,
                **kwargs: _method_router(
                    request, *args, method_to_view=method_to_view, **kwargs
                ),
            )
        )
    return urlpatterns


def route(
    path: str,
    *,
    method: Method | Sequence[Method],
    view: View,
    regex: bool = False,
) -> Route:
    return Route(path, method, view, regex)
