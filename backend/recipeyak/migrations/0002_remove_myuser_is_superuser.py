# Generated by Django 1.11.4 on 2017-08-06 13:31

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [("recipeyak", "0001_initial")]

    operations = [migrations.RemoveField(model_name="user", name="is_superuser")]
