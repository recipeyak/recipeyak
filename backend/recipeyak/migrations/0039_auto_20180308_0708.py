# Generated by Django 2.0.2 on 2018-03-08 07:08

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [("recipeyak", "0038_auto_20180307_0530")]

    operations = [
        migrations.RemoveField(model_name="cartitem", name="recipe"),
        migrations.DeleteModel(name="CartItem"),
    ]
