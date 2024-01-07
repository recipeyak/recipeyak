_TIME_DURATION_UNITS = (
    ("week", 60 * 60 * 24 * 7),
    ("day", 60 * 60 * 24),
    ("hour", 60 * 60),
    ("min", 60),
    ("sec", 1),
)


def human_time_duration(seconds: int) -> str:
    """
    from: https://gist.github.com/borgstrom/936ca741e885a1438c374824efb038b3
    """
    if seconds == 0:
        return "inf"
    parts = []
    for unit, div in _TIME_DURATION_UNITS:
        amount, seconds = divmod(int(seconds), div)
        if amount > 0:
            parts.append("{} {}{}".format(amount, unit, "" if amount == 1 else "s"))
    return ", ".join(parts)
