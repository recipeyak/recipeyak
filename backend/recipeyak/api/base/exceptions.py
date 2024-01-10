from dataclasses import dataclass

from pydantic_core import ErrorDetails


@dataclass
class RequestValidationError(Exception):
    errors: list[ErrorDetails]
