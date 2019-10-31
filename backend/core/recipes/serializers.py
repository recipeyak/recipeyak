from rest_framework import serializers

from core.models import Ingredient, MyUser, Recipe, ScheduledRecipe, Step, Note, Team
from core.serialization import BaseModelSerializer, BaseRelatedField, BaseSerializer


class OwnerRelatedField(BaseRelatedField):
    """
    A custom field to use for the `owner` generic relationship.
    """

    def to_representation(self, value):
        if isinstance(value, Team):
            if self.export:
                return {"team": value.name}
            return {"id": value.id, "type": "team", "name": value.name}
        if isinstance(value, MyUser):
            if self.export:
                return {"user": value.email}
            return {"id": value.id, "type": "user"}
        raise Exception("Unexpected type of owner object")

    def __init__(self, *args, **kwargs):
        export = kwargs.pop("export", None)
        super().__init__(*args, **kwargs)
        self.export = export


class IngredientSerializer(BaseModelSerializer):
    """
    serializer the ingredient of a recipe
    """

    class Meta:
        model = Ingredient
        fields = ("id", "quantity", "name", "description", "position", "optional")

    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop("fields", None)

        super().__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class StepSerializer(BaseModelSerializer):
    """
    serializer the step of a recipe
    """

    class Meta:
        model = Step
        fields = ("id", "text", "position")

    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop("fields", None)

        super().__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class NoteSerializer(BaseModelSerializer):
    class Meta:
        model = Note
        read_only_fields = (
            "id",
            "created_by",
            "last_modified_by",
            "created",
            "modified",
        )
        fields = (*read_only_fields, "text")

    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop("fields", None)

        super().__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class RecipeSerializer(BaseModelSerializer):
    steps = StepSerializer(many=True, source="step_set")
    last_scheduled = serializers.DateField(source="get_last_scheduled", read_only=True)
    ingredients = IngredientSerializer(many=True, source="ingredient_set")
    notes = NoteSerializer(many=True, source="note_set", read_only=True)
    owner = OwnerRelatedField(read_only=True)
    # specify default None so we can use this as an optional field
    team = serializers.IntegerField(write_only=True, default=None)

    class Meta:
        model = Recipe
        fields = (
            "id",
            "name",
            "author",
            "source",
            "time",
            "ingredients",
            "steps",
            "notes",
            "servings",
            "edits",
            "modified",
            "owner",
            "team",
            "last_scheduled",
            "created",
        )
        read_only_fields = ("owner", "last_scheduled")

    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop("fields", None)

        super().__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

    def validate_steps(self, value):
        if value == []:
            raise serializers.ValidationError("steps are required")
        return value

    def validate_ingredients(self, value):
        if value == []:
            raise serializers.ValidationError("ingredients are required")
        return value

    def validate_team(self, value):
        if value is None:
            return None
        team = Team.objects.filter(id=value).first()
        if team is None:
            raise serializers.ValidationError("invalid team id provided")
        return team

    def create(self, validated_data) -> Recipe:
        """
        Since this a nested serializer, we need to write a custom create method.
        """
        ingredients = validated_data.pop("ingredient_set")
        steps = validated_data.pop("step_set")

        # essentially an optional field
        team = validated_data.pop("team")

        validated_data["owner"] = (
            team if team is not None else self.context["request"].user
        )

        recipe: Recipe = Recipe.objects.create(**validated_data)
        for ingredient in ingredients:
            Ingredient.objects.create(recipe=recipe, **ingredient)
        for step in steps:
            Step.objects.create(recipe=recipe, **step)
        return recipe


class RecipeMoveCopySerializer(BaseSerializer):
    id = serializers.IntegerField(max_value=None, min_value=0, write_only=True)
    type = serializers.ChoiceField(choices=["user", "team"], write_only=True)

    def validate(self, data):
        if data["type"] == "team" and not Team.objects.filter(id=data["id"]).exists():
            raise serializers.ValidationError("team must exist")
        if data["type"] == "user" and not MyUser.objects.filter(id=data["id"]).exists():
            raise serializers.ValidationError("user must exist")
        return data


class RecipeTimelineSerializer(BaseModelSerializer):
    class Meta:
        model = ScheduledRecipe
        fields = ("id", "on")
