from __future__ import annotations

from collections import defaultdict
from collections.abc import Sequence
from dataclasses import dataclass

from recipeyak.inflect import singularize
from recipeyak.parsing import BaseUnit, Quantity, parse_quantity


@dataclass(frozen=True, kw_only=True, slots=True)
class Ingredient:
    quantity: str
    name: str
    description: str = ""


def normalize_ingredient_name(*, name: str) -> str:
    return name.replace("-", " ").lower()


def combine_ingredients(ingredients: Sequence[Ingredient]) -> dict[str, list[Quantity]]:
    # being kind of dynamic with the types here so not the easiest on the eyes.
    ingredient_map: dict[str, dict[BaseUnit | str | None, Quantity]] = defaultdict(dict)

    plural_name = dict[str, str]()

    for ingr in ingredients:
        normalized_name = normalize_ingredient_name(name=ingr.name)
        quantity = parse_quantity(ingr.quantity)
        base_unit = quantity.unit.base_unit()
        name = singularize(normalized_name)

        # keep track of whether an ingredient should be plural
        if name != normalized_name:
            plural_name[name] = normalized_name

        if base_unit == BaseUnit.UNKNOWN:
            # For each Unit.UNKNOWN, we treat the unknown_unit, as a unique
            # base value.
            if quantity.unknown_unit not in ingredient_map[name]:
                ingredient_map[name][quantity.unknown_unit] = quantity
            else:
                ingredient_map[name][quantity.unknown_unit] += quantity
        elif name not in ingredient_map:
            ingredient_map[name][base_unit] = quantity
        else:
            base_unit_quantity = ingredient_map[name].get(base_unit)
            if base_unit_quantity is None:
                ingredient_map[name][base_unit] = quantity
            else:
                ingredient_map[name][base_unit] = base_unit_quantity + quantity

    output: dict[str, list[Quantity]] = defaultdict(list)
    for ingre_name, unit_to_quantity in ingredient_map.items():
        name = plural_name.get(ingre_name, ingre_name)
        output[name] += unit_to_quantity.values()
    return output
