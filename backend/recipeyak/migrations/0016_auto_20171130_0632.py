# Generated by Django 1.11.7 on 2017-11-30 06:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("recipeyak", "0015_auto_20171116_1924")]

    operations = [
        migrations.AlterField(
            model_name="recipe",
            name="author",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name="recipe",
            name="source",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name="recipe",
            name="time",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
