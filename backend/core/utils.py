from typing import List, Dict

from pint import UnitRegistry, UndefinedUnitError
from pint.quantity import _Quantity as Quantity

ureg = UnitRegistry()


def combine_ingredients(ingredients: List) -> List:

    combined: Dict[str, Dict[str, Quantity]] = {}

    for ingredient in ingredients:
        try:
            quantity = ureg.parse_expression(ingredient.quantity)
        except UndefinedUnitError:
            quantity = ingredient.quantity

        name = ingredient.name

        try:
            base_unit = quantity.to_base_units().units
        except AttributeError:
            base_unit = quantity

        in_combined = combined.get(name, None) is not None
        if in_combined:
            if combined.get(name).get(base_unit, None) is not None:
                combined[name][base_unit] += quantity
            else:
                combined[name][base_unit] = quantity

        else:
            combined[name] = {}
            combined[name][base_unit] = quantity

    simple_ingredients = []
    for name, v in combined.items():
        unit, = v.values()
        simple_ingredients.append({
            'unit': str(unit),
            'name': name
        })

    return simple_ingredients
