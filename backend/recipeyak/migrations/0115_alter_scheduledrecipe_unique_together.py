# Generated by Django 3.2.9 on 2023-02-12 04:29

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("recipeyak", "0114_alter_upload_created_by"),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name="scheduledrecipe",
            unique_together=set(),
        ),
    ]
