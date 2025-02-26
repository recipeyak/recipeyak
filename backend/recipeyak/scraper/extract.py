"""
IO-free recipe-scraping
"""

from __future__ import annotations

import base64
import binascii
import json
from dataclasses import dataclass
from typing import cast

import extruct
from markdownify import markdownify
from recipe_scrapers import AbstractScraper
from recipe_scrapers._exceptions import SchemaOrgException

from recipeyak.scraper.format_time import human_time_duration
from recipeyak.string import starts_with


@dataclass(frozen=True, slots=True, kw_only=True)
class _ExtractedRecipe:
    title: str | None
    total_time: str | None
    yields: str | None
    instructions: list[str]
    # the first param of the tuple will be None in the case of a
    ingredient_groups: list[_IngredientGroup]
    author: str | None
    canonical_url: str | None
    image_urls: list[str | None]


@dataclass(frozen=True, slots=True, kw_only=True)
class _IngredientGroup:
    name: str | None
    ingredients: list[str]


def _extract_open_graph_image(html: bytes | str) -> str | None:
    og_data = extruct.extract(html, syntaxes=["opengraph"], uniform=True)["opengraph"]
    if not og_data:
        return None
    return cast(str | None, og_data[0].get("og:image"))


def _extract_tips(parsed: AbstractScraper) -> list[str]:
    nextjs_data_tag = parsed.soup.find(
        "script", type="application/json", id="__NEXT_DATA__"
    )
    if nextjs_data_tag is None:
        return []
    # TODO: make more robust, this is really only intended for nyt cooking
    try:
        json_next_data = json.loads(base64.b64decode(nextjs_data_tag.text))
    except (json.JSONDecodeError, binascii.Error):
        return []
    try:
        tips: list[str] = json_next_data["props"]["pageProps"]["recipe"]["tips"]
    except KeyError:
        # https://www.americastestkitchen.com/recipes/12373-apple-fennel-remoulade
        # uses nextjs but doesn't have the same structure as nyt cooking for
        # their props ofc
        return []
    return tips


def _extract_total_time(parsed: AbstractScraper) -> str | None:
    try:
        total_time = parsed.total_time()
        if total_time is None:
            return None
        return human_time_duration(total_time * 60)
    except SchemaOrgException:
        return None


_YIELD_PREFIXES = {"Serves", "Servings", "Makes", "Creates"}


def _extract_yields(parsed: AbstractScraper) -> str | None:
    # We don't want to use the library's yields method as it's buggy
    # see: https://github.com/hhursev/recipe-scrapers/issues/960
    if yield_data := parsed.schema.data.get("recipeYield") or parsed.schema.data.get(
        "yield"
    ):
        if isinstance(yield_data, list):
            yield_data = yield_data[0]
        yield_str = str(yield_data)
        for prefix in _YIELD_PREFIXES:
            if starts_with(yield_str, prefix):
                return yield_str.removeprefix(prefix)
            return yield_str
    return None


def _extract_author(parsed: AbstractScraper) -> str | None:
    try:
        return cast(str | None, parsed.author())
    except AttributeError:
        return None


def _extract_ingredient_groups(parsed: AbstractScraper) -> list[_IngredientGroup]:
    try:
        ingredient_groups = list[_IngredientGroup]()
        for group in parsed.ingredient_groups():
            ingredient_groups.append(
                _IngredientGroup(name=group.purpose, ingredients=group.ingredients)
            )
        return ingredient_groups
    except ValueError:
        # There's a chance the library will throw an error
        return [_IngredientGroup(name=None, ingredients=parsed.ingredients())]


def extract_recipe(parsed: AbstractScraper) -> _ExtractedRecipe:
    """
    Extact what data we can from the html without doing any IO

    There is some IO involved in elsewhere for determining the best image to
    use, but this module should be io-free, which makes testing and structuring
    easier
    """
    total_time = _extract_total_time(parsed)
    tips_html = _extract_tips(parsed)
    yields = _extract_yields(parsed)
    author = _extract_author(parsed)
    ingredient_groups = _extract_ingredient_groups(parsed)
    canonical_url = parsed.canonical_url()
    instructions = parsed.instructions_list()
    if tips_html:
        # NOTE: we don't have a tips construct in the data model so we stuff
        # them into a final step and add a markdown header
        tips_markdown = [markdownify(t) for t in tips_html]
        tips_blob = "\n\n".join(tips_markdown)
        instructions.append("**Tips**\n" + tips_blob)
    title = parsed.title()

    # possible image urls that we figure out the best one later on by actually fetching them
    og_image_url = _extract_open_graph_image(parsed.page_data)
    image_urls = [og_image_url, parsed.image()]

    return _ExtractedRecipe(
        canonical_url=canonical_url,
        title=title,
        total_time=total_time,
        ingredient_groups=ingredient_groups,
        yields=yields,
        author=author,
        instructions=instructions,
        image_urls=image_urls,
    )
