# Generated by Django 2.0.2 on 2018-06-24 18:25

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0059_auto_20180624_1823'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='scheduledrecipe',
            unique_together={('recipe', 'on', 'user'), ('recipe', 'on', 'team')},
        ),
    ]
