from typing import TypeVar

_T = TypeVar("_T")


def unwrap(arg: _T | None) -> _T:
    assert arg is not None
    return arg
