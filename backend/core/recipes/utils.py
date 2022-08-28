from __future__ import annotations

from typing import Any


def add_positions(recipe_steps: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Add `position` to step data if missing."""
    missing_position = any(s.get("position") is None for s in recipe_steps)
    if missing_position:
        for i, step in enumerate(recipe_steps):
            step["position"] = i + 10.0
    return recipe_steps
