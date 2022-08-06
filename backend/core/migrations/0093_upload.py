# Generated by Django 3.2.9 on 2022-08-05 03:56

import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0092_user_name"),
    ]

    operations = [
        migrations.CreateModel(
            name="Upload",
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
                ("created", models.DateTimeField(default=django.utils.timezone.now)),
                ("modified", models.DateTimeField(auto_now=True)),
                ("bucket", models.TextField()),
                ("key", models.TextField()),
                ("completed", models.BooleanField()),
                (
                    "created_by",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="uploads",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
    ]
