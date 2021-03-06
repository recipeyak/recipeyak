# Generated by Django 2.0.2 on 2018-03-24 00:20

from django.db import migrations


def add_creator_to_invite(apps, schema_editor):
    """
    set the creator of the invite to default to the admin of the membership
    """
    Invite = apps.get_model("core", "Invite")

    for invite in Invite.objects.all():
        if invite.creator is None:
            first_admin = invite.membership.team.membership_set.filter(
                is_active=True, level="admin"
            ).first()
            if first_admin is None:
                # just delete 'dangling' teams (without an admin)
                invite.delete()
            else:
                invite.creator = first_admin.user
                invite.save()


class Migration(migrations.Migration):

    dependencies = [("core", "0042_invite_creator")]

    operations = [migrations.RunPython(add_creator_to_invite)]
