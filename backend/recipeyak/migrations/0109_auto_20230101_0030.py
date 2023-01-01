# Generated by Django 3.2.9 on 2023-01-01 00:30

from typing import Any

import structlog
from django.db import migrations

logger = structlog.stdlib.get_logger()


def migrate(apps: Any, schema_editor: Any) -> None:
    db_alias = schema_editor.connection.alias

    User = apps.get_model("recipeyak", "User")
    Team = apps.get_model("recipeyak", "Team")
    Membership = apps.get_model("recipeyak", "Membership")

    users_without_teams = (
        User.objects.using(db_alias).filter(schedule_team_id__isnull=True).all()
    )

    logger.info("migrating users", total=users_without_teams.count())

    for user in users_without_teams:
        logger.info("migrating user", user_id=users_without_teams.count())
        team = Team.objects.create(name="Personal")
        membership = Membership.objects.create(
            team=team, user=user, level="admin", is_active=True
        )
        user.schedule_team = team
        user.save()
        logger.info(
            "migrating user done!",
            user_id=users_without_teams.count(),
            team_id=team.id,
            membership_id=membership.id,
        )


class Migration(migrations.Migration):

    dependencies = [
        ("recipeyak", "0108_auto_20221224_2014"),
    ]

    operations = [migrations.RunPython(migrate)]
