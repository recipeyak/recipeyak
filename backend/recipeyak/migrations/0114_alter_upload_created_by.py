# Generated by Django 3.2.9 on 2023-01-04 04:35

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("recipeyak", "0113_upload_scraped_by"),
    ]

    operations = [
        migrations.AlterField(
            model_name="upload",
            name="created_by",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="uploads",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
