from rest_framework import serializers

from .models import (
    MyUser,
    Recipe,
    Ingredient,
    Step,
    Team,
    ScheduledRecipe,
)

from core.recipes.serializers import RecipeSerializer


class UserSerializer(serializers.ModelSerializer):
    """
    serializer custom user model

    This should only be used for requesting the users information
    """

    class Meta:
        model = MyUser
        editable = False
        fields = ('id', 'email', 'avatar_url', 'has_usable_password')


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
