import pydantic


class RequestParams(pydantic.BaseModel):
    """
    ValidationErrors raised by subclasses of this model will be converted into
    400 errors.
    """


class StrTrimmed(pydantic.ConstrainedStr):
    strip_whitespace = True
