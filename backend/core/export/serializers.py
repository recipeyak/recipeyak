from rest_framework import serializers

from core.recipes.serializers import IngredientSerializer, OwnerRelatedField

from core.models import Recipe


class RecipeExportSerializer(serializers.ModelSerializer):

    steps = serializers.ListField(child=serializers.CharField())

    ingredients = IngredientSerializer(
        many=True,
        read_only=True,
        fields=("quantity", "name", "description", "optional"),
    )
    owner = OwnerRelatedField(read_only=True, export=True)

    class Meta:
        model = Recipe
        fields = (
            "name",
            "author",
            "time",
            "source",
            "servings",
            "ingredients",
            "steps",
            "owner",
        )
