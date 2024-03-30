# Generated by Django 3.2.9 on 2024-03-30 16:54

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("recipeyak", "0133_recipefavorite"),
    ]

    operations = [
        migrations.AddConstraint(
            model_name="recipefavorite",
            constraint=models.UniqueConstraint(
                fields=("recipe", "user"), name="recipe_user_uniq"
            ),
        ),
    ]