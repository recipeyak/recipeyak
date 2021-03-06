# Generated by Django 2.0.2 on 2018-03-24 06:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("core", "0044_auto_20180324_0041")]

    operations = [
        migrations.AddField(
            model_name="invite",
            name="status",
            field=models.CharField(
                choices=[
                    ("open", "open"),
                    ("declined", "declined"),
                    ("accepted", "accepted"),
                ],
                default="open",
                max_length=11,
            ),
        )
    ]
