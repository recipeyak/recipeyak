def add_positions(recipe_steps):
    """Add `position` to step data if missing."""
    missing_position = any(s.get("position") is None for s in recipe_steps)
    if missing_position:
        for i, step in enumerate(recipe_steps):
            step["position"] = i + 10.0
    return recipe_steps
