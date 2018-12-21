from rest_framework import serializers

from core.models import ScheduledRecipe

from core.recipes.serializers import RecipeSerializer


class ScheduledRecipeSerializer(serializers.ModelSerializer):
    recipe = RecipeSerializer(fields=("id", "name"))

    class Meta:
        model = ScheduledRecipe
        fields = ("id", "recipe", "on", "count", "team", "user")


class ScheduledRecipeSerializerCreate(serializers.ModelSerializer):
    class Meta:
        model = ScheduledRecipe
        fields = ("id", "recipe", "on", "count")

    def create(self, validated_data):
        recipe = validated_data.pop("recipe")
        return recipe.schedule(**validated_data)
