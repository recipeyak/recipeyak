# Generated by Django 3.2.9 on 2022-12-19 20:36

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("recipeyak", "0104_upload_background_url"),
    ]

    operations = [
        migrations.AddField(
            model_name="recipe",
            name="primary_image",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="+",
                to="recipeyak.upload",
            ),
        ),
        migrations.AddField(
            model_name="upload",
            name="recipe",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="uploads",
                to="recipeyak.recipe",
            ),
        ),
        migrations.RunSQL(
            """
update core_upload
set recipe_id = sub.recipe_id
from (select core_note.recipe_id, core_upload.id from core_note  join core_upload on core_upload.note_id = core_note.id) sub

where sub.id = core_upload.id;
        """
        ),
    ]
