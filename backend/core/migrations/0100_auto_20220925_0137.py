# Generated by Django 3.2.9 on 2022-09-25 01:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0099_auto_20220830_0405'),
    ]

    operations = [
        migrations.AddField(
            model_name='ingredient',
            name='position_str',
            field=models.TextField(null=True),
        ),
        migrations.AddField(
            model_name='section',
            name='position_str',
            field=models.TextField(null=True),
        ),
        migrations.AddField(
            model_name='step',
            name='position_str',
            field=models.TextField(null=True),
        ),
        migrations.AlterField(
            model_name='section',
            name='position',
            field=models.FloatField(),
        ),
    ]
