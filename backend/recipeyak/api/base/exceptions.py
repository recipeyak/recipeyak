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


class APIError(Exception):
    def __init__(self, *, code: str, message: str, status: int = 400) -> None:
        self.code = code
        self.message = message
        self.status = status
