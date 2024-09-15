from io import StringIO
from pathlib import Path
from pprint import pprint

from syrupy.assertion import SnapshotAssertion

from recipeyak.scraper.scrape_recipe import _parse_recipe


def test_parse_recipe_tips_html_to_markdown(snapshot: SnapshotAssertion) -> None:
    """
    Check that we convert tips from html to markdown.
    """
    html = (
        Path(__file__).parent
        / "test_data"
        / "1023609-chile-crisp-fettuccine-alfredo-with-spinach.html"
    ).read_bytes()

    result = _parse_recipe(
        html=html,
        url="https://cooking.nytimes.com/recipes/1023609-chile-crisp-fettuccine-alfredo-with-spinach",
    )
    assert result == snapshot()


def test_parse_links_in_steps(snapshot: SnapshotAssertion) -> None:
    """
    Check that we convert links from html to markdown in steps.
    """
    html = (
        Path(__file__).parent
        / "test_data"
        / "pressure-cooker-fast-and-easy-chicken-enchiladas-food-lab-recipe.html"
    ).read_bytes()

    result = _parse_recipe(
        html=html,
        url="https://www.seriouseats.com/pressure-cooker-fast-and-easy-chicken-enchiladas-food-lab-recipe",
    )
    assert result == snapshot()
