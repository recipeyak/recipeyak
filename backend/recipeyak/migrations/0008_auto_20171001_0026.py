# Generated by Django 1.11.4 on 2017-10-01 00:26

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("recipeyak", "0007_auto_20170917_0333")]

    operations = [
        migrations.RemoveField(model_name="cart", name="user"),
        migrations.RemoveField(model_name="cartitem", name="cart"),
        migrations.AddField(
            model_name="cartitem",
            name="user",
            field=models.ForeignKey(
                default=1,
                on_delete=django.db.models.deletion.CASCADE,
                to=settings.AUTH_USER_MODEL,
            ),
            preserve_default=False,
        ),
        migrations.DeleteModel(name="Cart"),
    ]
