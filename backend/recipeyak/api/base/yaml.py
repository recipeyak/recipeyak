from __future__ import annotations

from io import BytesIO
from typing import Any

from ruamel.yaml import YAML


def yaml_dumps(data: Any) -> bytes:
    yaml = YAML()
    stream = BytesIO()
    yaml.dump(data, stream)
    return stream.getvalue()


def yaml_loads(data: bytes) -> Any:
    yaml = YAML()
    stream = BytesIO(data)
    return yaml.load(stream)
