from pathlib import Path

from syrupy.assertion import SnapshotAssertion

from recipeyak.scraper.scrape_recipe import _parse_recipe


def test_parse_recipe_tips_html_to_markdown(
    snapshot: SnapshotAssertion,
) -> None:
    """
    Test with __NEXT_DATA__ being base64 encoded.

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


def test_parse_recipe_tips_html_to_markdown_plain_text(
    snapshot: SnapshotAssertion,
) -> None:
    """
    Check that we convert tips from html to markdown.

    Test with __NEXT_DATA__ being plain text.
    """
    html = (
        Path(__file__).parent / "test_data" / "1025652-oven-smores.html"
    ).read_bytes()

    result = _parse_recipe(
        html=html,
        url="https://cooking.nytimes.com/recipes/1025652-oven-smores",
    )
    assert result == snapshot()


def test_parse_recipe_with_empty_trailing_howto_section(
    snapshot: SnapshotAssertion,
) -> None:
    """
    NYTimes occasionally emits a trailing empty `{"@type": "HowToSection"}`
    in recipeInstructions, which crashes recipe-scrapers when it tries to
    iterate the missing itemListElement. Make sure we still extract the steps.
    """
    html = (
        Path(__file__).parent
        / "test_data"
        / "778602430-honey-mustard-chicken-pasta.html"
    ).read_bytes()

    result = _parse_recipe(
        html=html,
        url="https://cooking.nytimes.com/recipes/778602430-honey-mustard-chicken-pasta",
    )
    assert result == snapshot()


def test_parse_recipe_with_howto_section_dict_item_list_element(
    snapshot: SnapshotAssertion,
) -> None:
    """
    NYTimes wraps some steps in a HowToSection whose `itemListElement` is a
    single dict instead of a list. recipe-scrapers iterates the dict and emits
    its keys (`@type`, `text`, `url`) as step text. Make sure we unwrap it.
    """
    html = (
        Path(__file__).parent
        / "test_data"
        / "777654990-cheeseburger-sliders.html"
    ).read_bytes()

    result = _parse_recipe(
        html=html,
        url="https://cooking.nytimes.com/recipes/777654990-cheeseburger-sliders",
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
