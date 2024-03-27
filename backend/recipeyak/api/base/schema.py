# ruff: noqa: ERA001 T201
from __future__ import annotations

import filecmp
import os
import re
import shutil
import string
import subprocess
import sys
import tempfile
import typing
import uuid
from collections import defaultdict
from contextlib import suppress
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Literal, NotRequired, TypedDict

import django
import jsonref
import pydantic
import typer

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
    request: dict[str, Any]
    response: dict[str, object]
    description: str | None = None
    view_name: str
    view_param_type_name: str
    view_return_type: Any


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
        _normalize_params_and_schema(path_params, endpoint)
        # GET related params have seperate representation vs request bodies in
        # Open API
        if endpoint.method == "get":
            params = _schema_to_open_api_params(endpoint.request)
            method_dict.setdefault("parameters", []).extend(params)
        elif endpoint.request["properties"]:
            if (
                "required" in endpoint.request
                and len(endpoint.request["required"]) == 0
            ):
                del endpoint.request["required"]
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

    return (
        path,
        method_dict,
    )


def _normalize_params_and_schema(
    path_params: dict[str, type], endpoint: _Endpoint
) -> None:
    """
    Remove the dupes from the overlap between path params and request body params
    """
    for param_name, param_type in path_params.items():
        param_types = endpoint.request["properties"].get(param_name)
        if param_types is None:
            raise TypeError(
                f"missing path param type, {param_name=} in {endpoint.name=} params."
            )
        if param_types["type"] != _open_api_param_type(param_type):
            raise TypeError(
                f"""\
mismatched types
  Expected '{_open_api_param_type(param_type)}' from urls.py, got '{param_types["type"]}' from param type.
  {param_name=} {endpoint.name=}
"""
            )
        # remove the path param from the request body since we include
        # it in the schema as parameters
        endpoint.request["properties"].pop(param_name)
        with suppress(ValueError):
            endpoint.request["required"].remove(param_name)


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
    # grab the return type: -> T
    return_type = endpoint_types.pop("return")
    if return_type is type(None):
        return_type_schema = None
    else:
        return_type_schema = pydantic.TypeAdapter(return_type).json_schema(
            mode="serialization"
        )

    try:
        request_params_type = endpoint_types.pop("params")
    except KeyError as e:
        raise ValueError(
            f"invalid schema, you must specify a parameter named 'param'. {route.view.__name__}"
        ) from e

    # issue with this is that it does a bunch of $defs stuff:
    # https://github.com/pydantic/pydantic/issues/889
    if request_params_type is type(None):
        request_type_schema = None
    else:
        request_type_schema = pydantic.TypeAdapter(request_params_type).json_schema(
            mode="validation"
        )

    name = route.view.__name__.removesuffix("_view").replace("_", " ")

    return _Endpoint(
        method=route.method,
        url=route.path,
        name=name,
        description=route.view.__doc__,
        request=_cleanup_schema(request_type_schema),
        response=_cleanup_schema(return_type_schema),
        view_name=route.view.__name__,
        view_param_type_name=request_params_type.__name__,
        view_return_type=return_type,
    )


def _validate_endpoint_type_names(endpoint: _Endpoint) -> bool:
    # TODO: in the future, when ruff supports plugins, this could be a lint rule
    # see: https://github.com/astral-sh/ruff/issues/283

    endpoint_base_type_name = (
        endpoint.view_name.removesuffix("_view").title().replace("_", "")
    )

    # param types should be PascalCase of the view name with a Param suffix.
    expected_request_type_name = endpoint_base_type_name + "Params"
    if (
        endpoint.view_param_type_name != "NoneType"
        and expected_request_type_name != endpoint.view_param_type_name
    ):
        print(
            f"Expected request params name to be {expected_request_type_name}, got {endpoint.view_param_type_name}",
        )
        return True

    # return types should be PascalCase of the view name with a Response suffix.
    # we ignore None and dict responses
    # for list responses, the inner item should be of type PascalCase of view
    # name + Item
    expected_return_type_name = endpoint_base_type_name + "Response"
    if endpoint.view_return_type is not type(None):
        if typing.get_origin(endpoint.view_return_type) is dict:
            # we don't check the params of a dict since it's usually a basic
            # mapping
            return False
        elif typing.get_origin(endpoint.view_return_type) is list:
            list_item_type_name: str = typing.get_args(endpoint.view_return_type)[
                0
            ].__name__
            expected_list_item_name = endpoint_base_type_name + "Item"
            if (
                list_item_type_name != expected_list_item_name
                and not list_item_type_name.endswith("Serializer")
            ):
                print(
                    f"Expected {endpoint.view_name} return type to be list[{expected_list_item_name}], got list[{list_item_type_name}]",
                )
                return True
        elif (
            expected_return_type_name != endpoint.view_return_type.__name__
            and not endpoint.view_return_type.__name__.endswith("Serializer")
        ):
            print(
                f"Expected {endpoint.view_name} return type to be {expected_return_type_name}, got {endpoint.view_return_type.__name__}",
            )
            return True
    return False


def _schema_from_routes(routes: list[Route]) -> tuple[dict[str, Any], bool]:
    paths = defaultdict[str, dict[str, Any]](dict)
    has_validation_error = False
    for r in routes:
        # regex endpoints or endpoints with multiple methods aren't part of the UI API
        if not r.regex and isinstance(r.method, str):
            endpoint = _route_to_endpoint(r)
            if _validate_endpoint_type_names(endpoint):
                has_validation_error = True
            method = endpoint.method.lower()
            (url, method_data) = _schema_from_endpoint(endpoint)
            paths[url][method] = method_data

    return {
        "openapi": "3.1.0",
        "info": {"title": "RecipeYak API", "version": "1.0.0"},
        "servers": [{"url": "https://recipeyak.com"}],
        "paths": paths,
    }, has_validation_error


def main(check: bool = False) -> None:
    dest_path = "api-schema.json"
    print(
        f"generating schema: path={dest_path}",
    )

    schema, validation_error = _schema_from_routes(routes)
    _fd, temp_file_path = tempfile.mkstemp(suffix=".json")
    Path(temp_file_path).write_bytes(json_dumps(schema, indent=True) + b"\n")

    print("formatting...")

    subprocess.run(
        (
            "./node_modules/.bin/prettier",
            "--config",
            ".prettierrc.js",
            "-w",
            "--log-level",
            "warn",
            "--cache",
            temp_file_path,
        ),
        check=True,
    )

    if check and validation_error:
        print(
            """
Validation errors found, please fix before committing."""
        )
        sys.exit(1)

    print("checking for changes...")
    unchanged = filecmp.cmp(temp_file_path, dest_path, shallow=False)
    if unchanged:
        print("no changes required!")
        sys.exit(0)

    if check:
        print(
            """
schema has changed, regenerate with:
./.venv/bin/python -m recipeyak.api.base.schema"""
        )
        sys.exit(1)

    shutil.move(temp_file_path, dest_path)
    print("done!")


if __name__ == "__main__":
    typer.run(main)
