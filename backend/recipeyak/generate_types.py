# ruff: noqa: ERA001
# ruff: noqa: T201
from __future__ import annotations

import re
import string
import typing
import uuid
from collections.abc import Callable, Sequence
from dataclasses import dataclass
from functools import cache, wraps
from itertools import chain
from pathlib import Path
from typing import Any, Generic, Literal, Protocol, TypeVar

import pydantic

_PATH_PARAMETER_COMPONENT_RE = re.compile(
    r"<(?:(?P<converter>[^>:]+):)?(?P<parameter>[^>]+)>"
)
_T = typing.TypeVar("_T")


def to_camel_case(text: str) -> str:
    return text[0] + text.title()[1:].replace("-", "").replace("_", "")


class ConverterProtocol(Protocol[_T]):
    regex: str

    def to_python(self, value: str) -> _T:
        ...

    def to_url(self, value: _T) -> str:
        ...


class IntConverter:
    regex = "[0-9]+"

    def to_python(self, value):
        return int(value)

    def to_url(self, value):
        return str(value)


class StringConverter:
    regex = "[^/]+"

    def to_python(self, value):
        return value

    def to_url(self, value):
        return value


class UUIDConverter:
    regex = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"

    def to_python(self, value):
        return uuid.UUID(value)

    def to_url(self, value):
        return str(value)


class SlugConverter(StringConverter):
    regex = "[-a-zA-Z0-9_]+"


class PathConverter(StringConverter):
    regex = ".+"


DEFAULT_CONVERTERS: dict[str, ConverterProtocol] = {
    "int": IntConverter(),
    "path": PathConverter(),
    "slug": SlugConverter(),
    "str": StringConverter(),
    "uuid": UUIDConverter(),
}


REGISTERED_CONVERTERS: dict[str, ConverterProtocol] = {}


def register_converter(
    converter: Callable[[], ConverterProtocol], type_name: str
) -> None:
    REGISTERED_CONVERTERS[type_name] = converter()
    get_converters.cache_clear()


@cache
def get_converters() -> dict[str, ConverterProtocol]:
    return {**DEFAULT_CONVERTERS, **REGISTERED_CONVERTERS}


def get_converter(raw_converter: str) -> ConverterProtocol:
    return get_converters()[raw_converter]


def _route_to_regex(
    route: str, is_endpoint: bool = False
) -> tuple[str, dict[str, ConverterProtocol]]:
    """
    Convert a path pattern into a regular expression. Return the regular
    expression and a dictionary mapping the capture names to the converters.
    For example, 'foo/<int:pk>' returns '^foo\\/(?P<pk>[0-9]+)'
    and {'pk': <django.urls.converters.IntConverter>}.
    """
    original_route = route
    parts = ["^"]
    converters: dict[str, ConverterProtocol] = {}
    while True:
        match = _PATH_PARAMETER_COMPONENT_RE.search(route)
        if not match:
            parts.append(re.escape(route))
            break
        elif not set(match.group()).isdisjoint(string.whitespace):
            raise ValueError(
                "URL route '%s' cannot contain whitespace in angle brackets "
                "<…>." % original_route
            )
        parts.append(re.escape(route[: match.start()]))
        route = route[match.end() :]
        parameter = match["parameter"]
        if not parameter.isidentifier():
            raise ValueError(
                "URL route '{}' uses parameter name {!r} which isn't a valid "
                "Python identifier.".format(original_route, parameter)
            )
        raw_converter = match["converter"]
        if raw_converter is None:
            # If a converter isn't specified, the default is `str`.
            raw_converter = "str"
        try:
            converter = get_converter(raw_converter)
        except KeyError as e:
            raise ValueError(
                f"URL route {original_route!r} uses invalid converter {raw_converter!r}."
            ) from e
        converters[parameter] = converter
        parts.append("(?P<" + parameter + ">" + converter.regex + ")")
    if is_endpoint:
        parts.append("$")
    return "".join(parts), converters


class Member(pydantic.BaseModel):
    id: int
    name: str
    avatar_url: str
    email: str


class Team(pydantic.BaseModel):
    id: int
    name: str
    tags: list[str]
    members: list[str]
    # TODO:
    # members: list[Member]


class RequestParams(pydantic.BaseModel):
    offset: int | None = None
    limit: int | None = None
    some_id: int | str
    ids_with_str: list[str]
    ids_with_int: list[int]


class TeamListRequestParams(pydantic.BaseModel):
    offset: int | None = None
    limit: int | None = None


class Request(Generic[_T]):
    ...


class Response(Generic[_T]):
    def __init__(self, data: _T) -> None:
        self.data = data


# Define type variables for request and response
RequestType = TypeVar("RequestType")
ResponseType = TypeVar("ResponseType")


def api(
    auth: bool = False
) -> Callable[[Callable[..., ResponseType]], Callable[..., ResponseType]]:
    def decorator_func(
        func: Callable[..., ResponseType]
    ) -> Callable[..., ResponseType]:
        @wraps(func)
        def wrapper(*args: RequestType, **kwargs: RequestType) -> ResponseType:
            # Check authentication if auth is True
            if auth:
                print("auth check")
                # Authentication logic goes here
                # For example, checking request headers, tokens, etc.
                authenticated = True
                if not authenticated:
                    return "Authentication failed", 401  # Unauthorized status code

            # Call the original function
            return func(*args, **kwargs)

        return wrapper

    return decorator_func


@api(auth=True)
def team_list(request: Request[TeamListRequestParams]) -> Response[list[Team]]:
    return Response([])


@api(auth=True)
def team_retrieve(request: Request[RequestParams]) -> Response[Team]:
    return Response(Team(id=1213, name="bar", tags=[], members=[]))


@api(auth=True)
def team_update(request: Request[RequestParams]) -> Response[Team]:
    return Response(Team(id=1213, name="bar", tags=[], members=[]))


@api(auth=True)
def team_delete(request: Request[RequestParams]) -> Response[None]:
    return Response(None)


@api(auth=True)
def team_create(request: Request[RequestParams]) -> Response[Team]:
    return Response(Team(id=1213, name="bar", tags=[], members=[]))


def path(path: str, method: str, cb: Callable) -> tuple[str, str, Callable]:
    return (path, method, cb)


def team_member_update(request: Request[RequestParams]) -> Response[Team]:
    return Response(Team(id=1213, name="bar", tags=[], members=[]))


urlpatterns = [
    # path("teams/", "get", team_list),
    path("teams/", "post", team_create),
    path("teams/<int:team_id>", "get", team_retrieve),
    path("teams/<int:team_id>", "patch", team_update),
    path("teams/<int:team_id>", "delete", team_delete),
    path("teams/<int:team_id>/members/<int:member_id>", "patch", team_member_update),
]


@dataclass
class MethodSchema:
    method: str
    path: str
    queryType: Literal["mutation", "query"]
    jsUrlPath: str
    name: str
    hookName: str
    path_pattern: tuple[str, dict[str, ConverterProtocol[Any]]]
    request_type: Any
    return_type: Any
    request_url_ts: str
    request_type_ts: str
    response_type_ts: str


request_type = {
    "properties": {
        "limit": {"title": "Limit", "type": "integer"},
        "offset": {"title": "Offset", "type": "integer"},
    },
    "title": "RequestParams",
    "type": "object",
}


@dataclass
class JSONType:
    required: bool
    type: Literal["string", "number", "object", "array", "boolean", "null"]


request_type_2 = {
    "limit": JSONType(required=False, type="number"),
    "offset": JSONType(required=False, type="number"),
}


out = list[MethodSchema]()


def typescript_type_from_schema(
    schema: dict[str, Any] | None, additional_props: Sequence[str] = []
) -> str:
    if schema is None:
        return "void"
    type_ts = """{\n"""
    for prop in chain(schema["properties"], additional_props):
        type_name = "string"
        type_ts += f'"{prop}": {type_name}\n'
    type_ts += "}"
    return type_ts


def create_or_update_file(meta: MethodSchema) -> None:
    path = f"../frontend/src/queries/{meta.hookName}.ts"
    if Path(path).exists() and Path(path).read_text():
        print("UPDATING...")
        updated_lines = list[str]()
        lines = Path(path).read_text().splitlines()
        for line in lines:
            if line.strip() == "// AUTOGEN":
                updated_text = f"""
// AUTOGEN
function {meta.name}(params: 
{meta.request_type_ts}
): Promise<
{meta.response_type_ts}
> {{
return httpx({{
    method: {meta.method!r},
    url: {meta.request_url_ts},
    params,
}})
}}
    """
                Path(path).write_text("\n".join(updated_lines) + updated_text)
            else:
                updated_lines.append(line)

    else:
        print("CREATING...")
        Path(path).touch()
        header = (
            f"""
import {{ useMutation }} from "@tanstack/react-query"

import {{ httpx }} from "@/http"

export function {meta.hookName}() {{
  return useMutation({{
    mutationFn: {meta.name},
  }})
}}
"""
            if meta.queryType == "mutation"
            else f"""
import {{ useQuery }} from "@tanstack/react-query"

import {{ httpx }} from "@/http"

export function {meta.hookName}() {{
  return useQuery({{
    // TODO: setup query key
    // queryKey: [{meta.name!r}],
    queryFn: {meta.name},
  }})
}}
"""
        )

        # TODO: we need to seperate payload from params, aka url params and
        # request data params need to be in their own objects
        # maybe function signatures should look like:
        #
        # function foo(params: { teamId: number; payload: { name: string } })
        #
        # or
        #
        # function foo(params: {
        #   params: { teamId: number }
        #   payload: { name: string }
        # }): void
        end = f"""
// AUTOGEN
function {meta.name}(params: 
{meta.request_type_ts}
): Promise<
{meta.response_type_ts}
> {{
return httpx({{
    method: {meta.method!r},
    url: {meta.request_url_ts},
    params,
}})
}}
"""

        Path(path).write_text(header + end)


def typescript_url(path_pattern: tuple[str, dict[str, ConverterProtocol]], path: str):
    matches = list(_PATH_PARAMETER_COMPONENT_RE.finditer(path))
    # print(matches)
    out = []
    begin = 0
    for match in matches:
        start, end = match.span()
        out.append(path[begin:start])
        param = match.groupdict()["parameter"]
        out.append("${params." + param + "}")
        begin = end

        # type = match.groupdict()["converter"]
        # print(param, type)
    return "`" + "".join(out) + "`"


def process_url_patterns(patterns: Sequence[tuple[str, str, Callable]]) -> None:
    for path, method, cb in patterns:
        # print("path", path, "method", method)
        return_class = typing.get_type_hints(cb)["return"]
        # print("response", return_class, type(return_class))
        return_type_wrapper = typing.get_args(return_class)[0]
        # print("return_type_wrapper", return_type_wrapper, type(return_type_wrapper))
        origin_type = typing.get_origin(return_type_wrapper)
        # print("origin type", origin_type, return_type_wrapper)
        if origin_type is list:
            return_type_schema = typing.get_args(return_type_wrapper)[0].schema()
        elif origin_type is None:
            if return_type_wrapper is type(None):
                return_type_schema = None
            else:
                return_type_schema = return_type_wrapper.schema()
        request_type = typing.get_type_hints(cb)["request"]
        # print("request", request_type)
        request_params = typing.get_args(request_type)[0]
        # print(path, method, cb, request_params.schema(), return_type_schema)

        fn_name = cb.__name__

        name = to_camel_case(fn_name)
        hook_name = to_camel_case("use_" + fn_name)

        request_schema = request_params.schema()

        request_type_ts = """{\n"""
        for prop in request_schema["properties"]:
            type_name = "string"
            request_type_ts += f'"{prop}": {type_name}\n'
        request_type_ts += "}"
        path_pattern = _route_to_regex(path)
        stuff = MethodSchema(
            method=method,
            path=path,
            queryType="query" if method == "get" else "mutation",
            jsUrlPath="",
            hookName=hook_name,
            name=name,
            path_pattern=path_pattern,
            request_type=request_schema,
            request_url_ts=typescript_url(path_pattern, path),
            request_type_ts=typescript_type_from_schema(
                request_schema, additional_props=list(path_pattern[1].keys())
            ),
            response_type_ts=typescript_type_from_schema(return_type_schema),
            return_type=return_type_schema,
        )

        out.append(stuff)
        create_or_update_file(stuff)
        # print("#" * 80)
        # print("#" * 80)

    # pprint(out)


process_url_patterns(urlpatterns)
