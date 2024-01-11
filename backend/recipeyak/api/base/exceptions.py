from __future__ import annotations

from collections.abc import Sequence
from typing import TypedDict

from pydantic_core import ErrorDetails


class Error(TypedDict):
    type: str
    loc: tuple[int | str, ...]
    msg: str


class RequestValidationError(Exception):
    errors: list[Error]

    def __init__(self, error_details: Sequence[ErrorDetails]) -> None:
        errors = [
            Error(type=error["type"], loc=error["loc"], msg=error["msg"])
            for error in error_details
        ]
        self.errors = errors
