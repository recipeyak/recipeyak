# Generated by Django 3.2.9 on 2023-10-04 20:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("recipeyak", "0117_checklist"),
    ]

    operations = [
        migrations.AddField(
            model_name="upload",
            name="content_type",
            field=models.TextField(default=""),
            preserve_default=False,
        ),
    ]
