# Generated by Django 2.2.12 on 2020-11-26 22:26

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("recipeyak", "0082_recipe_archived_at")]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="selected_team",
            field=models.ForeignKey(
                blank=True,
                db_column="selected_team_id",
                help_text="team currently focused on UI, null if personal items selected.",
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="+",
                to="recipeyak.Team",
            ),
        )
    ]
