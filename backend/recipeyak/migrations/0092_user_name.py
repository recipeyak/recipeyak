# Generated by Django 3.2.9 on 2022-07-29 23:24

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("recipeyak", "0091_alter_recipe_tags"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="name",
            field=models.TextField(null=True),
        ),
    ]
