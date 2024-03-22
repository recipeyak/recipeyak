from typing import Self

import pydantic
from pydantic.config import ConfigDict
from typing_extensions import Unpack

from recipeyak.api.base.exceptions import RequestValidationError


class Params(pydantic.BaseModel):
    """
    ValidationErrors raised by subclasses of this model will be converted into
    400 errors.
    """

    def __init_subclass__(cls, **kwargs: Unpack[ConfigDict]):
        # Can't do quick one-off lints with Ruff, so some runtime jazz to have more consistent params
        if not cls.__name__.endswith("Params"):
            raise ValueError(
                f"Params subclasses must end with 'Params', but {cls.__name__} does not. Update the class name to {cls.__name__}Params."
            )
        return super().__init_subclass__(**kwargs)

    @classmethod
    def parse_raw(cls, body: bytes) -> Self:  # type: ignore[override]
        try:
            return super().parse_raw(body)
        except pydantic.ValidationError as e:
            # ensure validations get rendered as a nice 400
            raise RequestValidationError(e.errors()) from e

    @classmethod
    def parse_obj(cls, obj: object) -> Self:
        try:
            return super().parse_obj(obj)
        except pydantic.ValidationError as e:
            # ensure validations get rendered as a nice 400
            raise RequestValidationError(e.errors()) from e
