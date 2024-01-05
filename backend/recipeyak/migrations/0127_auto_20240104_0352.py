# Generated by Django 3.2.9 on 2024-01-04 03:52

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("recipeyak", "0126_recipeindexqueue"),
    ]

    operations = [
        migrations.AddField(
            model_name="upload",
            name="profile",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="+",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="profile_upload",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="+",
                to="recipeyak.upload",
            ),
        ),
    ]