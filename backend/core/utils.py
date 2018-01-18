from typing import List, Dict

from pint import UnitRegistry, UndefinedUnitError
from pint.quantity import _Quantity as Quantity

ureg = UnitRegistry()


def not_real_quantity(quantity) -> bool:
    basic_quantities = ['some', 'sprinkle']
    return isinstance(quantity, str) and quantity.lower() in basic_quantities


def simplify_units(units):
    """
    tablespoon, sprinkle, some, pinch => tablespoon, sprinkle
    """
    combineable_ingredients = ['sprinkle', 'some', 'pinch']
    simplified = []
    some = False
    for u in units:
        if u in combineable_ingredients:
            some = True
        else:
            simplified.append(str(u))
    if some:
        simplified.append('some')
    return simplified


def max_quantity(quantity: str) -> str:
    """
    take the '4-5' medium button mushrooms and find the max
    """
    options = quantity.split('-')
    if len(options) == 1:
        return quantity
    return options[-1]


def combine_ingredients(ingredients: List) -> List:

    combined: Dict[str, Dict[str, Quantity]] = {}

    for ingredient in ingredients:

        try:
            quantity = ureg.parse_expression(max_quantity(ingredient.quantity))
            try:
                if str(quantity.units) in ['picoinch']:
                    quantity = 'pinch'
            except AttributeError:
                pass
        except UndefinedUnitError:
            quantity = ingredient.quantity

        name = ingredient.name.replace('-', ' ')

        try:
            base_unit = quantity.to_base_units().units
        except AttributeError:
            base_unit = ''

        if not_real_quantity(quantity):
            base_unit = 'some'

        in_combined = combined.get(name) is not None
        if in_combined:
            if combined.get(name).get(base_unit) is not None:
                if base_unit != 'some':
                    combined[name][base_unit] += quantity
            else:
                combined[name][base_unit] = quantity

        else:
            combined[name] = {}
            combined[name][base_unit] = quantity

    simple_ingredients = []
    for name, v in combined.items():
        combined_units = ''
        for unit in simplify_units(v.values()):
            if combined_units == '':
                combined_units += str(unit)
            else:
                combined_units += ' + ' + str(unit)
        simple_ingredients.append({
                'unit': combined_units,
                'name': name
            })

    return simple_ingredients
