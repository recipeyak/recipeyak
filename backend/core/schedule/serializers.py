from core.models import ScheduledRecipe
from core.recipes.serializers import RecipeSerializer
from core.serialization import BaseModelSerializer


class ScheduledRecipeSerializer(BaseModelSerializer):
    recipe = RecipeSerializer(fields=("id", "name"))

    class Meta:
        model = ScheduledRecipe
        fields = ("id", "recipe", "created", "on", "count", "team", "user")


class ScheduledRecipeSerializerCreate(BaseModelSerializer):
    class Meta:
        model = ScheduledRecipe
        fields = ("id", "recipe", "created", "on", "count")

    def create(self, validated_data):
        recipe = validated_data.pop("recipe")
        return recipe.schedule(**validated_data)
