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

    def __init__(
        self,
        error_details: Sequence[ErrorDetails],
    ) -> None:
        # TODO: this can be improved, we want a stricter subset of what pydantic
        # provides so the UI can more easily consume it
        errors: list[Error] = []
        for error in error_details:
            if isinstance(error["ctx"]["error"], ValueError):
                assert (
                    len(error["ctx"]["error"].args) == 1
                ), "Should only have one error message for a given value error."
                msg = error["ctx"]["error"].args[0]
            else:
                msg = error["msg"]
            errors.append(Error(type=error["type"], loc=error["loc"], msg=msg))
        self.errors = errors


class APIError(Exception):
    def __init__(self, *, code: str, message: str, status: int = 400) -> None:
        self.code = code
        self.message = message
        self.status = status
