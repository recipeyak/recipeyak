# Generated by Django 2.0.2 on 2018-05-14 19:25

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [("core", "0053_auto_20180513_0052")]

    operations = [
        migrations.RemoveField(model_name="tag", name="recipe"),
        migrations.AlterModelOptions(
            name="ingredient", options={"ordering": ["-position"]}
        ),
        migrations.AlterUniqueTogether(
            name="ingredient", unique_together={("recipe", "position")}
        ),
        migrations.DeleteModel(name="Tag"),
    ]
