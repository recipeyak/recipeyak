from typing import List
from rest_framework import serializers

from .models import (
    MyUser,
    Team,
    Membership,
    Invite,
)


class PublicUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = MyUser
        editable = False
        fields = ('id', 'email', 'avatar_url')


class TeamSerializer(serializers.ModelSerializer):

    emails = serializers.ListField(
        child=serializers.EmailField(write_only=True),
        write_only=True
    )

    level = serializers.ChoiceField(choices=Membership.MEMBERSHIP_CHOICES, write_only=True)

    class Meta:
        model = Team
        fields = ('id', 'name', 'emails', 'level')

    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop('fields', None)

        super().__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

    def create(self, validated_data) -> Team:
        emails = validated_data.pop('emails')
        level = validated_data.pop('level')
        team: Team = Team.objects.create(**validated_data)
        creator = self.context['request'].user
        for email in emails:
            Invite.objects.create_invite(email=email, team=team, level=level, creator=creator)
        return team


class MembershipSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer()

    class Meta:
        model = Membership
        editable = False
        fields = ('id', 'user', 'level', 'is_active',)

    def validate_level(self, level):
        team = self.instance.team
        user = self.instance.user
        demoting_last_admin = len(team.admins()) == 1 and \
            team.is_admin(user) and \
            level != Membership.ADMIN
        if demoting_last_admin:
            raise serializers.ValidationError("cannot demote last admin")
        return level


class InviteSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer()
    team = TeamSerializer(fields=['id', 'name'], read_only=True)
    creator = PublicUserSerializer()

    class Meta:
        model = Invite
        editable = False
        fields = ('id', 'user', 'team', 'active', 'creator', 'status')


class CreateInviteSerializer(serializers.Serializer):
    level = serializers.ChoiceField(choices=Membership.MEMBERSHIP_CHOICES, write_only=True)

    emails = serializers.ListField(
        child=serializers.EmailField(write_only=True),
        write_only=True
    )

    def validate_emails(self, emails):
        team = self.initial_data['team']
        return [email for email in emails
                if not team.invite_exists(email)]

    def create(self, validated_data) -> List[Invite]:
        emails = validated_data.pop('emails')
        # TODO(sbdchd): bulk create
        return [Invite.objects.create_invite(email=email,
                                             **validated_data)
                for email in emails]
