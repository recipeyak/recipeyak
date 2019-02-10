from typing import Optional, Any


def getattr_path(obj, path: str) -> Optional[Any]:
    temp = obj
    for item in path.split("."):
        temp = getattr(temp, item, None)
    if temp == obj:
        return None
    return temp
