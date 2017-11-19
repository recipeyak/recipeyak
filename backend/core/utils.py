from typing import List, Dict

from pint import UnitRegistry
from pint.quantity import _Quantity as Quantity

ureg = UnitRegistry()


def combine_ingredients(ingredients: List) -> List:

    combined: Dict[str, Dict[str, Quantity]] = {
        # 'name': {
        #     'base unit': <Quantity 1.234, 'tablespoon'>,
        # }
    }

    for ingredient in ingredients:
        quantity = ureg.parse_expression(ingredient.quantity)
        name = ingredient.name

        base_unit = quantity.to_base_units().units

        if combined.get(name, None) is not None:

            if combined.get(name).get(base_unit, None) is not None:
                combined[name][base_unit] += quantity
            else:
                combined[name][base_unit] = quantity

        else:
            combined[name] = {}
            combined[name][base_unit] = quantity

    simple_ingredients = []
    for name, v in combined.items():
        for unit in v.values():
            simple_ingredients.append({'unit': str(unit), 'name': name})

    return simple_ingredients
