# Generated by Django 2.0.2 on 2019-01-02 05:14

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [("recipeyak", "0063_auto_20181223_0614")]

    operations = [
        migrations.AlterModelOptions(
            name="ingredient", options={"ordering": ["position"]}
        ),
        migrations.AlterModelOptions(
            name="scheduledrecipe", options={"ordering": ["on"]}
        ),
        migrations.AlterModelOptions(name="step", options={"ordering": ["position"]}),
    ]
