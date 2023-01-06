from typing import Any, Literal

def extract(
    htmlstring: str | bytes,
    *,
    encoding: str = "UTF-8",
    syntaxes: list[str] = ...,
    errors: str = "strict",
    uniform: Literal[True],
    return_html_node: bool = ...,
    schema_context: str = ...,
    with_og_array: bool = ...,
) -> dict[str, list[dict[str, Any]]]: ...
