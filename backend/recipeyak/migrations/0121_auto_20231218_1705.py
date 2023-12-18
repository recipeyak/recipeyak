# Generated by Django 3.2.9 on 2023-12-18 17:05

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("recipeyak", "0120_alter_user_theme"),
    ]

    operations = [
        migrations.RenameField(
            model_name="user",
            old_name="theme",
            new_name="theme_day",
        ),
        migrations.AddField(
            model_name="user",
            name="theme_mode",
            field=models.TextField(default="single_theme"),
        ),
        migrations.AddField(
            model_name="user",
            name="theme_night",
            field=models.TextField(default="dark"),
        ),
    ]
