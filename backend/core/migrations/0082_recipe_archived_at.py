# Generated by Django 2.2.12 on 2020-11-21 15:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0081_auto_20200814_1706'),
    ]

    operations = [
        migrations.AddField(
            model_name='recipe',
            name='archived_at',
            field=models.DateTimeField(null=True),
        ),
    ]
