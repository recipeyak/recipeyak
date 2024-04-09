def starts_with(string: str, prefixes: tuple[str, ...] | str) -> bool:
    """
    case insensitive str.starts_with
    """
    if isinstance(prefixes, str):
        prefixes = (prefixes,)
    for prefix in prefixes:
        if string[: len(prefix)].casefold() == prefix.casefold():
            return True
    return False
