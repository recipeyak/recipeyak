# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2017-10-01 21:29
from __future__ import unicode_literals

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0010_auto_20171001_2119'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='cartitem',
            name='id',
        ),
        migrations.RemoveField(
            model_name='cartitem',
            name='user',
        ),
        migrations.AlterField(
            model_name='cartitem',
            name='count',
            field=models.IntegerField(default=0, validators=[django.core.validators.MinValueValidator(0)]),
        ),
        migrations.AlterField(
            model_name='cartitem',
            name='recipe',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to='core.Recipe'),
        ),
    ]
