# Generated by Django 3.2.9 on 2024-04-20 21:44

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("recipeyak", "0134_recipefavorite_recipe_user_uniq"),
    ]

    operations = [
        migrations.AddConstraint(
            model_name="ingredient",
            constraint=models.UniqueConstraint(
                fields=("recipe", "position"), name="ingredient_recipe_position_uniq"
            ),
        ),
        migrations.AddConstraint(
            model_name="section",
            constraint=models.UniqueConstraint(
                fields=("recipe", "position"), name="section_recipe_position_uniq"
            ),
        ),
        migrations.AddConstraint(
            model_name="step",
            constraint=models.UniqueConstraint(
                fields=("recipe", "position"), name="step_recipe_position_uniq"
            ),
        ),
    ]
