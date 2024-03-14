from datetime import UTC, datetime

from recipeyak.models.ingredient_historical import IngredientHistorical
from recipeyak.models.note import Note
from recipeyak.models.note_historical import NoteHistorical
from recipeyak.models.recipe import Recipe
from recipeyak.models.recipe_historical import RecipeHistorical
from recipeyak.models.section_historical import SectionHistorical
from recipeyak.models.step_historical import StepHistorical
from recipeyak.models.upload import Upload
from recipeyak.models.user import User


def save_recipe_version(
    *, recipe_id: int, actor: User | None, created: datetime | None = None
) -> None:
    """
    Called after writing recipe changes to the database.
    """
    recipe = Recipe.objects.get(id=recipe_id)
    recipe_historical = RecipeHistorical.objects.create(
        team_id=recipe.team_id,
        recipe_id=recipe.id,
        actor=actor,
        name=recipe.name,
        author=recipe.author,
        source=recipe.source,
        time=recipe.time,
        servings=recipe.servings,
        archived_at=recipe.archived_at,
        tags=recipe.tags,
        primary_image_id=recipe.primary_image_id,
        created=created or datetime.now(UTC),
    )
    ingredients = []
    for ingredient in recipe.ingredient_set.all():
        ingredients.append(
            IngredientHistorical(
                ingredient_id=ingredient.id,
                team_id=recipe.team_id,
                recipe_historical=recipe_historical,
                quantity=ingredient.quantity,
                name=ingredient.name,
                description=ingredient.description,
                position=ingredient.position,
                optional=ingredient.optional,
            )
        )
    IngredientHistorical.objects.bulk_create(ingredients)
    sections = []
    for section in recipe.section_set.all():
        sections.append(
            SectionHistorical(
                section_id=section.id,
                team_id=recipe.team_id,
                recipe_historical=recipe_historical,
                title=section.title,
                position=section.position,
            )
        )
    SectionHistorical.objects.bulk_create(sections)
    steps = []
    for step in recipe.step_set.all():
        steps.append(
            StepHistorical(
                step_id=step.id,
                team_id=recipe.team_id,
                recipe_historical=recipe_historical,
                text=step.text,
                position=step.position,
            )
        )
    StepHistorical.objects.bulk_create(steps)


def save_note_version(note: Note, *, actor: User) -> None:
    # record the current note state
    NoteHistorical.objects.create(
        note=note,
        actor=actor,
        text=note.text,
        upload_ids=list(Upload.objects.filter(note=note).values_list("id", flat=True)),
    )
