from collections import defaultdict
from collections.abc import Callable, Sequence
from dataclasses import dataclass
from typing import Any, Literal

from django.http import HttpRequest, HttpResponse, HttpResponseNotAllowed
from django.urls import URLPattern, re_path
from django.urls import path as django_path

Method = Literal["get", "post", "patch", "delete", "head"]


@dataclass
class Route:
    path: str
    method: Method
    view: Callable[..., Any]
    regex: bool


def _method_router(
    request: HttpRequest,
    *args: Any,
    method_to_view: dict[str, Callable[..., Any]],
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


def routes(*routes: Route) -> list[URLPattern]:
    path_to_routes = defaultdict[str, list[Route]](list)
    for route in routes:
        path_to_routes[route.path].append(route)

    urlpatterns = list[URLPattern]()
    for p, views in path_to_routes.items():
        method_to_view = dict[str, Callable[..., Any]]()
        is_regex = False
        for view in views:
            method_to_view[view.method] = view.view
            is_regex = is_regex or view.regex

        create_path = django_path if not is_regex else re_path
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
    method: Method,
    view: Callable[..., Any],
    regex: bool = False,
) -> Route:
    return Route(path, method, view, regex)
