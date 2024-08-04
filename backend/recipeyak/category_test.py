import csv
from collections import defaultdict
from pathlib import Path
from textwrap import dedent

from syrupy.assertion import SnapshotAssertion

from recipeyak.category import _DEPARTMENT_MAPPING, category


def test_categorize_ingredients() -> None:
    """
    Ensure we have a category set for each ingredient
    """
    out = defaultdict(set)
    with (Path() / "ingredients.csv").open() as f:
        reader = csv.DictReader(f)
        for row in reader:
            item = row["name"]
            cat = category(item.lower())
            out[cat].add(item)

    expected_unknown = {
        "for a 9-inch double crust pie (see other recipe)",
        "thinly sliced",
    }

    out["unknown"] -= expected_unknown

    assert not out["unknown"], f'remaining {len(out["unknown"])}'


def test_categorize_ingredient_test_cases(snapshot: SnapshotAssertion) -> None:
    cases = dedent(
        """
    (13-ounce) can unsweetened coconut milk
    (14.5-ounce) can whole or crushed tomatoes
    (15-ounce) cans chickpeas
    (6-inch) corn tortillas
    1 lime
    1-inch piece ginger
    1/4 ounce active dry yeast
    14 oz cans of diced tomatoes
    14.5-ounce can whole peeled tomatoes
    15-ounce can chickpeas
    15-ounce container ricotta cheese
    28 ounce can San Marzano tomatoes
    28-ounce can whole tomatoes
    3-to-3.5-pound butternut squash
    4-ounce milk chocolate bar
    Asian fish sauce
    Chinese rice wine
    Grated Parmigiano-Reggiano
    all-butter puff pastry
    almond butter
    almond paste
    apple cider vinegar
    baby bok choy
    beef broth
    beef or chicken broth
    beef stock
    best-quality apricot jam or orange marmalade
    bulk hot or sweet breakfast sausage or Italian sausage
    butternut squash
    butternut squash (1 small squash)
    chicken stock
    chinese egg noodles
    coconut extract
    coconut oil
    coconut rum or dark rum
    coconut sugar or substitute brown sugar
    corn torillas
    corn tortilla chips
    corn tortillas
    cornmeal
    cornstarch
    cream of coconut
    cream of tartar
    creamy unsweetened peanut butter
    crystallized ginger
    cubanelle peppers
    dark corn syrup
    diced canned tomatoes
    dill pickle chips
    doubanjiang (Sichuanese fermented chile bean paste; see Note)
    dried green split peas
    dry mustard powder
    eggplant
    finely chopped cornichons or small kosher dill pickles
    finely grated ginger
    fish sauce
    barley rusks
    slices bread
    boti masala
    cloves garlic
    garlic cloves
    dried oregano
    onion powder
    graham cracker crumbs
    fennel seed
    ground ginger
    hamburger buns
    haricot vert fins or green beans
    harissa or tomato paste
    hot italian sausage
    large poblano pepper
    lemon extract
    red bird eye chillies, roughly chopped
    light corn syrup
    store bought or homemade za’atar
    loaf sweet egg bread like challah or brioche
    oyster sauce
    fresno peppers
    cherry or grape tomatoes
    matcha powder
    sesame aioli
    chipotle aioli (store bought)
    low sodium chicken stock
    low-sodium chicken broth
    malted milk powder
    medium-coarse yellow cornmeal
    tomato paste
    """  # noqa: RUF001
    ).splitlines()

    assert sorted((w, category(w)) for w in cases) == snapshot()


def test_no_overlap_between_categories() -> None:
    mapping = {key: set(value) for key, value in _DEPARTMENT_MAPPING.items()}

    for key, value in mapping.items():
        for other_key, other_value in mapping.items():
            if key == other_key:
                continue
            overlap = value & other_value
            assert not overlap, f"{overlap} in {key} and {other_key}"
