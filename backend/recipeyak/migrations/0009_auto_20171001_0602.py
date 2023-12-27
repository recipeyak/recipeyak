# Generated by Django 1.11.4 on 2017-10-01 06:02

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("recipeyak", "0008_auto_20171001_0026")]

    operations = [
        migrations.AlterField(
            model_name="cartitem",
            name="count",
            field=models.IntegerField(
                validators=[django.core.validators.MinValueValidator(0)]
            ),
        )
    ]
