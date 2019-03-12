from typing import List, Dict, Union, Optional, Iterable
from mypy_extensions import TypedDict

from pint import UnitRegistry, UndefinedUnitError
from pint.quantity import _Quantity as Quantity

from .inflect import singularize, pluralize

import core.models as models

ureg = UnitRegistry()


def simplify_units(units) -> List[str]:
    """
    tablespoon, sprinkle, some, pinch => tablespoon, some
    """
    combineable_ingredients = ["sprinkle", "some", "pinch"]
    simplified = []
    some = False
    for u in units:
        if isinstance(u, str) and any(i in u for i in combineable_ingredients):
            some = True
        else:
            simplified.append(str(u))
    if some:
        simplified.append("some")
    return simplified


def not_real_quantity(quantity) -> bool:
    basic_quantities = ["some", "sprinkle"]
    return isinstance(quantity, str) and quantity.lower() in basic_quantities


def max_quantity(quantity: str) -> str:
    """
    take the '4-5' medium button mushrooms and find the max
    """
    return quantity.split("-")[-1]


def ingredient_quantity(quantity: str) -> Union[str, Quantity]:
    try:
        quant: Quantity = ureg.parse_expression(max_quantity(quantity))
        try:
            if str(quant.units) in ["picoinch"]:
                return "pinch"
        except AttributeError:
            pass
        return quant
    except UndefinedUnitError:
        return quantity


def quantity_baseunit(quantity):
    if not_real_quantity(quantity):
        return "some"
    try:
        return quantity.to_base_units().units
    except AttributeError:
        return ""


def normalize_name(name: str) -> str:
    return name.replace("-", " ").lower()


def should_pluralize(s) -> bool:
    for u in s:
        try:
            if u > 1:
                return True
        except (ValueError, TypeError):
            pass
    return False


UNICODE_FRACTION_MAPPING = {
    "½": "1/2",
    "⅓": "1/3",
    "⅔": "2/3",
    "¼": "1/4",
    "¾": "3/4",
    "⅕": "1/5",
    "⅖": "2/5",
    "⅗": "3/5",
    "⅘": "4/5",
    "⅙": "1/6",
    "⅚": "5/6",
    "⅐": "1/7",
    "⅛": "1/8",
    "⅜": "3/8",
    "⅝": "5/8",
    "⅞": "7/8",
    "⅑": "1/9",
    "⅒": "1/10",
}


def unicode_fractions_to_ascii(s: str) -> str:
    """
    convert occurances of unicode fractions like `½` to their ascii
    equivalent `1/2`
    """

    output = ""
    for char in s:
        output += UNICODE_FRACTION_MAPPING.get(char, char)

    return output


class OriginDict(TypedDict):
    recipe: int
    quantity: str


class SimpleIngredientDict(TypedDict):
    unit: str
    name: str
    origin: List[OriginDict]


class IngredientList:
    """
    Handles combining of ingredients into a list
    """

    def __init__(self, ingredients: Optional[Iterable["Ingredient"]] = None) -> None:
        self.combined: Dict[str, Dict[str, Quantity]] = {}

        if ingredients:
            for ingre in ingredients:
                self.__add__(ingre)

    def dump(self) -> List[SimpleIngredientDict]:
        """
        Returns a JSON serializable representation of the ingredient list
        """
        simple_ingredients: List[SimpleIngredientDict] = []
        for name, v in self.combined.items():
            combined_units = " + ".join(simplify_units(v["units"].values()))
            plural = pluralize(name) if should_pluralize(name) else v.get("plural")
            simple_ingredients.append(
                {"unit": combined_units, "name": plural or name, "origin": v["origin"]}
            )

        return simple_ingredients

    def __add__(self, other: "Ingredient") -> "IngredientList":
        quantity = ingredient_quantity(other.quantity)
        base_unit = quantity_baseunit(quantity)
        other_name = other.name.lower()
        name = normalize_name(other_name)
        singular_name = singularize(name)

        if self.combined.get(singular_name):
            if self.combined[singular_name]["units"].get(base_unit):
                self.combined[singular_name]["units"][base_unit] += quantity
            else:
                self.combined[singular_name]["units"][base_unit] = quantity
        else:
            self.combined[singular_name] = {
                "units": {base_unit: quantity},
                "origin": [],
            }

        self.combined[singular_name]["origin"].append(
            {"recipe": other.origin, "quantity": str(quantity)}
        )

        is_plural = name != singular_name
        if is_plural:
            self.combined[singular_name]["plural"] = other_name

        return self

    def __len__(self) -> int:
        return len(self.combined.keys())

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__}: {self.combined}>"


class Ingredient:
    """
    essentially a non-django version of models.Ingredient
    """

    def __init__(self, ingredient: models.Ingredient) -> None:
        # Note(sbdchd): pint doesn't handle casing
        self.quantity = unicode_fractions_to_ascii(ingredient.quantity.lower())
        self.name = ingredient.name
        self.origin = ingredient.recipe.id

    def __add__(self, other: "Ingredient") -> "IngredientList":
        ingredient_list = IngredientList()
        ingredient_list += self
        ingredient_list += other
        return ingredient_list

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__}: quantity={self.quantity} name={self.name}>"


def combine_ingredients(
    ingredients: List[models.Ingredient]
) -> List[SimpleIngredientDict]:
    """
    utilizes IngredientList and simplifies ingredients
    """
    if not ingredients:
        return []

    return IngredientList(Ingredient(ingre) for ingre in ingredients).dump()
