import datetime


class Recipe():
    """Representation of recipe."""

    def __init__(self, title, author, source, ingredients):
        """Create recipe with title, author, and ingredients."""
        self._title = title
        self._author = author
        self._ingredients = ingredients
        self._creation_date = datetime.datetime.now()

    @property
    def title(self):
        """Return title of recipe."""
        return self._title

    @property
    def author(self):
        """Return author of recipe."""
        return self._author

    @property
    def ingredients(self):
        """Return list of Ingredient objects."""
        return self._ingredients

    def __str__(self):
        """Return string representation of recipe."""
        return f"{self._title} by {self._author}"


class Ingredient():
    """Ingredient for recipe."""

    def __init__(self, name, quantity, amount, tags=None):
        """Create ingredient."""
        self._name = name.lower()
        self._quantity = quantity
        self._amount = amount
        if tags is None:
            self._tags = []
        elif isinstance(tags, str):
            self._tags = [tags]
        elif isinstance(tags, list):
            self._tags = tags
        else:
            raise ValueError("Tags must be of type string, list of strings, or None")

    @property
    def name(self):
        """Return Ingredient name."""
        return self._name

    @property
    def quantity(self):
        """Return quantity of ingredients."""
        return self._quantity

    @property
    def amount(self):
        """Return Pint object representing Ingredient amount."""
        return self._amount

    @property
    def tags(self):
        """Return tags for organizing ingredient.

        Diary, produce, baking, meat, etc.
        """
        return self._tags

    def __str__(self):
        """Return string representation of ingredient."""
        return f"{self._quantity} {self._amount} of {self._name}"
