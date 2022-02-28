import csv
from collections import defaultdict
from pathlib import Path

from core.cumin.cat import category


def test_categorize_ingredients() -> None:
    out = defaultdict(set)
    with (Path(".") / "ingredients.csv").open() as f:
        reader = csv.DictReader(f)
        for row in reader:
            item = row["name"]
            cat = category(item.lower())
            out[cat].add(item)

    expected_unknown = {
        "for a 9-inch double crust pie (see other recipe)",
    }

    out["unknown"] -= expected_unknown

    assert not out["unknown"], f'remaining {len(out["unknown"])}'
