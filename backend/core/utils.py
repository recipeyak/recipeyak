from typing import List, Dict

from pint import UnitRegistry, UndefinedUnitError
from pint.quantity import _Quantity as Quantity

ureg = UnitRegistry()


def not_real_quantity(quantity) -> bool:
    basic_quantities = ['some', 'sprinkle']
    return isinstance(quantity, str) and quantity.lower() in basic_quantities


def combine_ingredients(ingredients: List) -> List:

    combined: Dict[str, Dict[str, Quantity]] = {}

    for ingredient in ingredients:

        try:
            quantity = ureg.parse_expression(ingredient.quantity)
        except UndefinedUnitError:
            quantity = ingredient.quantity

        name = ingredient.name.replace('-', ' ')

        try:
            base_unit = quantity.to_base_units().units
        except AttributeError:
            base_unit = ''

        if not_real_quantity(quantity):
            base_unit = quantity

        in_combined = combined.get(name) is not None
        if in_combined:
            if combined.get(name).get(base_unit) is not None:
                combined[name][base_unit] += quantity
            else:
                combined[name][base_unit] = quantity

        else:
            combined[name] = {}
            combined[name][base_unit] = quantity

    simple_ingredients = []
    for name, v in combined.items():
        for unit in v.values():
            simple_ingredients.append({
                'unit': str(unit),
                'name': name
            })

    return simple_ingredients
