from pathlib import Path

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
