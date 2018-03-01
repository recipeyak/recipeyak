from rest_framework import serializers

from .models import (
    MyUser,
    Recipe,
    Ingredient,
    Step,
    Tag,
    CartItem,
    Team,
    Membership,
    Invite,
)

class UserSerializer(serializers.ModelSerializer):
    """
    serializer custom user model
    """

    class Meta:
        model = MyUser
        editable = False
        fields = ('id', 'email', 'avatar_url', 'has_usable_password')


class IngredientSerializer(serializers.ModelSerializer):
    """
    serializer the ingredient of a recipe
    """

    class Meta:
        model = Ingredient
        fields = ('id', 'quantity', 'name', 'description')


class CartItemSerializer(serializers.ModelSerializer):
    """
    serializer CartItem items
    """

    class Meta:
        model = CartItem
        fields = ('recipe', 'count',)


class StepSerializer(serializers.ModelSerializer):
    """
    serializer the step of a recipe
    """

    class Meta:
        model = Step
        fields = ('id', 'text',)


class TagSerializer(serializers.ModelSerializer):
    """
    serializer the Tag of a recipe
    """

    class Meta:
        model = Tag
        fields = ('id', 'text',)


class RecipeSerializer(serializers.ModelSerializer):
    """
    serializer recipe
    """

    steps = StepSerializer(many=True)
    ingredients = IngredientSerializer(many=True)
    tags = TagSerializer(many=True, default=[])

    class Meta:
        model = Recipe
        fields = ('id', 'name', 'author', 'source', 'time', 'ingredients',
                  'steps', 'tags', 'servings', 'edits', 'modified',
                  'cart_count')

    def validate_steps(self, value):
        if value == []:
            raise serializers.ValidationError('steps are required')
        return value

    def validate_ingredients(self, value):
        if value == []:
            raise serializers.ValidationError('ingredients are required')
        return value

    def create(self, validated_data) -> Recipe:
        """
        Since this a nested serializer, we need to write a custom create method.
        """
        ingredients = validated_data.pop('ingredients')
        steps = validated_data.pop('steps')
        tags = validated_data.pop('tags')
        recipe = Recipe.objects.create(**validated_data)
        for ingredient in ingredients:
            Ingredient.objects.create(recipe=recipe, **ingredient)
        for step in steps:
            Step.objects.create(recipe=recipe, **step)
        for tag in tags:
            Tag.objects.create(recipe=recipe, **tag)
        return recipe


class MostAddedRecipeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Recipe
        fields = ('id', 'name', 'author', 'total_cart_additions')


class TeamSerializer(serializers.ModelSerializer):

    class Meta:
        model = Team
        fields = ('id', 'name', )


class MembershipSerializer(serializers.ModelSerializer):

    class Meta:
        model = Membership
        fields = ('id', 'user', )


class InviteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invite
        fields = ('id', 'user',)
