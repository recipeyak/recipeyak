# Generated by Django 2.0.2 on 2018-05-09 01:47

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0049_auto_20180505_0104'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='recipe',
            name='deleted_at',
        ),
    ]
