# ruff: noqa: ERA001 T201
from __future__ import annotations

import os
import re
import string
import subprocess
import typing
import uuid
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Literal, NotRequired, TypedDict

import django
import jsonref
import pydantic

from recipeyak.api.base.json import json_dumps
from recipeyak.api.base.router import Route

os.environ.setdefault("DEBUG", "1")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "recipeyak.django.settings")
django.setup()
from recipeyak.api.urls import routes  # noqa: E402


@dataclass(slots=True, kw_only=True, frozen=True)
class _Endpoint:
    url: str
    method: Literal["get", "post", "put", "patch", "delete", "head"]
    name: str
    request: dict[str, object]
    response: dict[str, object]
    param_types: dict[str, Any]
    description: str | None = None


class _RequestBodyDict(TypedDict):
    required: bool
    content: dict[str, Any]


class _MethodDict(TypedDict):
    description: NotRequired[str]
    requestBody: NotRequired[_RequestBodyDict]
    responses: NotRequired[dict[str, Any]]
    parameters: NotRequired[list[dict[str, Any]]]
    operationId: str


def _open_api_param_type(param_type: type) -> str:
    if param_type is int:
        return "integer"
    if param_type is str:
        return "string"
    raise ValueError(f"unexpected type, {param_type}")


def _schema_to_open_api_params(schema: dict[str, Any]) -> list[dict[str, Any]]:
    """
    {
      "properties": {
        "start": {
          "format": "date",
          "type": "string"
        },
        "end": {
          "format": "date",
          "type": "string"
        }
      },
      "required": ["start", "end"],
      "type": "object"
    }

    becomes

    {"parameters": [
        {
            "name": "start",
            "in": "path",
            "required": true,
            "schema": {
                "type": "string",
                "format": "date"
            }
        },
        {
            "name": "end",
            "in": "path",
            "required": true,
            "schema": {
                "type": "string",
                "format": "date"
            }
        },
      ]
    }
    """
    required_params = set(schema["required"])
    params = list[dict[str, Any]]()
    for field_name, field_schema in schema["properties"].items():
        params.append(
            {
                "name": field_name,
                "in": "query",
                "required": field_name in required_params,
                "schema": field_schema,
            }
        )

    return params


def _schema_from_endpoint(endpoint: _Endpoint) -> tuple[str, _MethodDict]:
    path, path_params = _django_route_to_open_api(endpoint.url)

    if not path.startswith("/"):
        path = "/" + path

    parameters = []
    for param_name, param_type in path_params.items():
        if param_type is not endpoint.param_types[param_name]:
            raise TypeError(
                f"""\
mismatched types
  Expected {param_type} from urls.py, got {endpoint.param_types[param_name]} from function signature.
  {param_name=} {endpoint.name=}
"""
            )

        parameters.append(
            {
                "name": param_name,
                "in": "path",
                "required": True,
                "schema": {"type": _open_api_param_type(param_type)},
            }
        )

    method_dict: _MethodDict = {"operationId": endpoint.name.title().replace(" ", "")}
    if parameters:
        method_dict["parameters"] = parameters
    if endpoint.description is not None:
        method_dict["description"] = endpoint.description
    if endpoint.request is not None:
        if endpoint.method == "get":
            params = _schema_to_open_api_params(endpoint.request)
            method_dict.setdefault("parameters", []).extend(params)
        else:
            method_dict["requestBody"] = {
                "required": True,
                "content": {"application/json": {"schema": endpoint.request}},
            }

    method_dict["responses"] = {}
    if endpoint.response is not None:
        method_dict["responses"]["200"] = {
            "content": {"application/json": {"schema": endpoint.response}},
            "description": "Successful response.",
        }
    else:
        method_dict["responses"]["204"] = {"description": "No content"}

    if endpoint.method == "get":
        assert not method_dict.get(
            "requestBody"
        ), f"shouldn't have a request body for get requests, use params instead. {endpoint.url}"

    # TODO: shoppinglistRetrieve
    # - return type is wrong
    # - path params is wrong

    # validation
    # ensure that parameter names and request body names do not overlap since we
    # combine them into the args in typescript land
    path_param_names = {x["name"] for x in method_dict.get("parameters", [])}
    # only care about the top level for overlap
    if "requestBody" in method_dict:
        request_body_param_names = set(
            method_dict["requestBody"]["content"]["application/json"]["schema"][
                "properties"
            ]
        )
    else:
        request_body_param_names = set()

    if overlap := request_body_param_names.intersection(path_param_names):
        raise ValueError(
            f"""URL Path Param names and Request Body param names can't overlap. Overlapping names: {overlap}"""
        )

    return (
        path,
        method_dict,
    )


_PATH_PARAMETER_TYPE_RE = re.compile(
    r"<(?:(?P<type_name>[^>:]+):)?(?P<parameter>[^>]+)>"
)


_TYPE_NAME_TO_TYPE = {
    "int": int,
    "str": str,
    "uuid": uuid.UUID,
}


def _django_route_to_open_api(route: str) -> tuple[str, dict[str, type]]:
    """
    taken from: https://github.com/django/django/blob/9c6d7b4a678b7bbc6a1a14420f686162ba9016f5/django/urls/resolvers.py#L253-L296

    Copyright (c) Django Software Foundation and individual contributors.
    All rights reserved.

    Redistribution and use in source and binary forms, with or without modification,
    are permitted provided that the following conditions are met:

        1. Redistributions of source code must retain the above copyright notice,
        this list of conditions and the following disclaimer.

        2. Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.

        3. Neither the name of Django nor the names of its contributors may be used
        to endorse or promote products derived from this software without
        specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
    ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
    WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
    DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
    ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
    ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
    SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
    """
    original_route = route
    parts: list[str] = []
    converters: dict[str, type] = {}
    while True:
        match = _PATH_PARAMETER_TYPE_RE.search(route)
        if not match:
            parts.append(route)
            break
        elif not set(match.group()).isdisjoint(string.whitespace):
            raise ValueError(
                f"URL route '{original_route}' cannot contain whitespace in angle brackets <…>."
            )
        parts.append(route[: match.start()])
        route = route[match.end() :]
        parameter = match["parameter"]
        if not parameter.isidentifier():
            raise ValueError(
                f"URL route '{original_route}' uses parameter name {parameter:!r} which isn't a valid Python identifier."
            )
        type_name = match["type_name"] or "str"
        converters[parameter] = _TYPE_NAME_TO_TYPE[type_name]
        parts.append("{" + parameter + "}")
    return "".join(parts), converters


def _cleanup_schema(data: dict[str, Any]) -> dict[str, Any]:
    """
    inline all the refs

    and adjust the schema to have less junk from the pydantic output
    """
    data = jsonref.replace_refs(data, lazy_load=False, proxies=False)

    if isinstance(data, dict) and "$defs" in data:
        del data["$defs"]

    _remove_titles(data, parent_key=None)
    return data


def _remove_titles(
    data: dict[str, Any] | Any, parent_key: str | None
) -> dict[str, Any] | Any:
    if isinstance(data, dict):
        # don't want to remove actual properties that happened to be named
        # title, just the extra description stuff
        if "title" in data and parent_key != "properties":
            del data["title"]
        for key, value in data.items():
            _remove_titles(value, parent_key=key)

    if isinstance(data, list):
        for value in data:
            _remove_titles(value, parent_key=parent_key)
    return data


def _route_to_endpoint(route: Route) -> _Endpoint:
    assert isinstance(route.method, str)
    endpoint_types = typing.get_type_hints(route.view)
    # grab the return type: JsonResponse[T]
    return_class = endpoint_types.pop("return")
    # get the type param: T
    try:
        return_type_wrapper = typing.get_args(return_class)[0]
    except IndexError as e:
        raise ValueError(
            f"invalid schema, you must specify a return type param: {route.view.__name__}"
        ) from e
    if return_type_wrapper is type(None):
        return_type = None
    else:
        return_type = pydantic.TypeAdapter(return_type_wrapper).json_schema(
            mode="serialization"
        )

    request_class = endpoint_types.pop("request")
    try:
        request_type_wrapper = typing.get_args(request_class)[0]
    except IndexError as e:
        raise ValueError(
            f"invalid schema, you must specify a request type param. {route.view.__name__}"
        ) from e

    # issue with this is that it does a bunch of $defs stuff:
    # https://github.com/pydantic/pydantic/issues/889
    if request_type_wrapper is type(None):
        request_type = None
    else:
        request_type = pydantic.TypeAdapter(request_type_wrapper).json_schema(
            mode="validation"
        )

    param_types = endpoint_types

    name = route.view.__name__.removesuffix("_view").replace("_", " ")

    return _Endpoint(
        method=route.method,
        url=route.path,
        name=name,
        description=route.view.__doc__,
        request=_cleanup_schema(request_type),
        response=_cleanup_schema(return_type),
        param_types=param_types,
    )


def _schema_from_routes(routes: list[Route]) -> dict[str, Any]:
    paths = defaultdict[str, dict[str, Any]](dict)
    for r in routes:
        # regex endpoints or endpoints with multiple methods aren't part of the UI API
        if not r.regex and isinstance(r.method, str):
            endpoint = _route_to_endpoint(r)
            method = endpoint.method.lower()
            (url, method_data) = _schema_from_endpoint(endpoint)
            paths[url][method] = method_data

    return {
        "openapi": "3.1.0",
        "info": {"title": "RecipeYak API", "version": "1.0.0"},
        "servers": [{"url": "https://recipeyak.com"}],
        "paths": paths,
    }


def main() -> None:
    path = "api-schema.json"
    print(
        f"generating schema: {path=}",
    )

    schema = _schema_from_routes(routes)
    Path(path).write_bytes(json_dumps(schema, indent=True) + b"\n")

    print("formatting...")

    subprocess.run(
        (
            "../frontend/node_modules/.bin/prettier",
            "-w",
            "--log-level",
            "warn",
            "--cache",
            "../backend/" + path,
        ),
        cwd="../frontend/",
        check=True,
    )

    print("done!")


if __name__ == "__main__":
    main()
