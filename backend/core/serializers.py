from typing import List
from rest_framework import serializers

from .models import (
    MyUser,
    Recipe,
    Ingredient,
    Step,
    Team,
    Membership,
    Invite,
    ScheduledRecipe,
)


class UserSerializer(serializers.ModelSerializer):
    """
    serializer custom user model

    This should only be used for requesting the users information
    """

    class Meta:
        model = MyUser
        editable = False
        fields = ('id', 'email', 'avatar_url', 'has_usable_password')


class PublicUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = MyUser
        editable = False
        fields = ('id', 'email', 'avatar_url')


class IngredientSerializer(serializers.ModelSerializer):
    """
    serializer the ingredient of a recipe
    """

    class Meta:
        model = Ingredient
        fields = ('id', 'quantity', 'name', 'description', 'position', 'optional')

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


class StepSerializer(serializers.ModelSerializer):
    """
    serializer the step of a recipe
    """

    class Meta:
        model = Step
        fields = ('id', 'text', 'position')

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


class OwnerRelatedField(serializers.RelatedField):
    """
    A custom field to use for the `owner` generic relationship.
    """

    def to_representation(self, value):
        if isinstance(value, Team):
            if self.export:
                return {'team': value.name}
            return {'id': value.id, 'type': 'team', 'name': value.name}
        elif isinstance(value, MyUser):
            if self.export:
                return {'user': value.email}
            return {'id': value.id, 'type': 'user'}
        raise Exception('Unexpected type of owner object')

    def __init__(self, *args, **kwargs):
        export = kwargs.pop('export', None)
        super().__init__(*args, **kwargs)
        self.export = export


class RecipeSerializer(serializers.ModelSerializer):
    """
    serializer recipe
    """

    steps = StepSerializer(many=True)
    ingredients = IngredientSerializer(many=True)
    owner = OwnerRelatedField(read_only=True)
    # specify default None so we can use this as an optional field
    team = serializers.IntegerField(write_only=True, default=None)

    class Meta:
        model = Recipe
        fields = ('id', 'name', 'author', 'source', 'time', 'ingredients',
                  'steps', 'servings', 'edits', 'modified',
                  'owner', 'team')
        read_only_fields = ('owner',)

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

    def validate_steps(self, value):
        if value == []:
            raise serializers.ValidationError('steps are required')
        return value

    def validate_ingredients(self, value):
        if value == []:
            raise serializers.ValidationError('ingredients are required')
        return value

    def validate_team(self, value):
        if value is None:
            return None
        team = Team.objects.filter(id=value).first()
        if team is None:
            raise serializers.ValidationError('invalid team id provided')
        return team

    def create(self, validated_data) -> Recipe:
        """
        Since this a nested serializer, we need to write a custom create method.
        """
        ingredients = validated_data.pop('ingredients')
        steps = validated_data.pop('steps')

        # essentially an optional field
        team = validated_data.pop('team')

        validated_data['owner'] = team if team is not None \
            else self.context['request'].user

        recipe: Recipe = Recipe.objects.create(**validated_data)
        for ingredient in ingredients:
            Ingredient.objects.create(recipe=recipe, **ingredient)
        for step in steps:
            Step.objects.create(recipe=recipe, **step)
        return recipe


class RecipeExportSerializer(serializers.ModelSerializer):

    steps = serializers.ListField(
        child=serializers.CharField(),
    )

    ingredients = IngredientSerializer(
        many=True,
        read_only=True,
        fields=('quantity', 'name', 'description', 'optional'))
    owner = OwnerRelatedField(read_only=True, export=True)

    class Meta:
        model = Recipe
        fields = ('name', 'author', 'time', 'source', 'servings', 'ingredients', 'steps', 'owner')


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
        return [Invite.objects.create_invite(email=email,
                                             **validated_data)
                for email in emails]


class RecipeMoveCopySerializer(serializers.Serializer):
    id = serializers.IntegerField(max_value=None, min_value=0, write_only=True)
    type = serializers.ChoiceField(choices=['user', 'team'], write_only=True)

    def validate(self, data):
        if data['type'] == 'team' and not Team.objects.filter(id=data['id']).exists():
            raise serializers.ValidationError("team must exist")
        elif data['type'] == 'user' and not MyUser.objects.filter(id=data['id']).exists():
            raise serializers.ValidationError("user must exist")
        return data


class ScheduledRecipeSerializer(serializers.ModelSerializer):
    recipe = RecipeSerializer(fields=('id', 'name',))

    class Meta:
        model = ScheduledRecipe
        fields = ('id', 'recipe', 'on', 'count',)


class ScheduledRecipeSerializerCreate(serializers.ModelSerializer):

    class Meta:
        model = ScheduledRecipe
        fields = ('id', 'recipe', 'on', 'count',)

    def create(self, validated_data):
        recipe = validated_data.pop('recipe')
        return recipe.schedule(**validated_data)
