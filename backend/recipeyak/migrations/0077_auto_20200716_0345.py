# Generated by Django 2.2.12 on 2020-07-16 03:45

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("recipeyak", "0076_team_ical_id")]

    operations = [
        migrations.AlterField(
            model_name="recipechange",
            name="change_type",
            field=models.CharField(
                choices=[
                    ("NAME", "NAME"),
                    ("AUTHOR", "AUTHOR"),
                    ("SOURCE", "SOURCE"),
                    ("SERVINGS", "SERVINGS"),
                    ("TIME", "TIME"),
                    ("STEP_CREATE", "STEP_CREATE"),
                    ("STEP_UPDATE", "STEP_UPDATE"),
                    ("STEP_DELETE", "STEP_DELETE"),
                    ("INGREDIENT_CREATE", "INGREDIENT_CREATE"),
                    ("INGREDIENT_UPDATE", "INGREDIENT_UPDATE"),
                    ("INGREDIENT_DELETE", "INGREDIENT_DELETE"),
                    ("SECTION_CREATE", "SECTION_CREATE"),
                    ("SECTION_UPDATE", "SECTION_UPDATE"),
                    ("SECTION_DELETE", "SECTION_DELETE"),
                ],
                help_text="The field / model changed.",
                max_length=255,
            ),
        ),
        migrations.CreateModel(
            name="Section",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "deleted_at",
                    models.DateTimeField(blank=True, default=None, null=True),
                ),
                ("created", models.DateTimeField(auto_now_add=True)),
                ("modified", models.DateTimeField(auto_now=True)),
                (
                    "title",
                    models.CharField(
                        help_text="name of the ingredient section group", max_length=255
                    ),
                ),
                (
                    "position",
                    models.FloatField(
                        help_text="position of the section across both the ingredients and other sections for a recipe."
                    ),
                ),
                (
                    "recipe",
                    models.ForeignKey(
                        help_text="Recipe the section is part of.",
                        on_delete=django.db.models.deletion.CASCADE,
                        to="recipeyak.Recipe",
                    ),
                ),
            ],
            options={"ordering": ["position"], "db_table": "core_section"},
        ),
    ]
