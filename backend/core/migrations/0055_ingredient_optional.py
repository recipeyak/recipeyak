# Generated by Django 2.0.2 on 2018-05-27 03:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("core", "0054_auto_20180514_1925")]

    operations = [
        migrations.AddField(
            model_name="ingredient",
            name="optional",
            field=models.BooleanField(default=False),
        )
    ]
