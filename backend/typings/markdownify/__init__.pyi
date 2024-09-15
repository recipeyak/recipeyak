from typing import Any, Protocol, TypeVar

# taken from: https://github.com/python/typeshed/blob/dbe4d32a2a7e9c92689cdf850c00153c59ac2286/stdlib/_typeshed/__init__.pyi#L254
_T_co = TypeVar("_T_co", covariant=True)

class _SupportsRead(Protocol[_T_co]):
    def read(self, length: int = ..., /) -> _T_co: ...

def markdownify(
    html: str | bytes | _SupportsRead[str] | _SupportsRead[bytes], **options: Any
) -> str: ...
