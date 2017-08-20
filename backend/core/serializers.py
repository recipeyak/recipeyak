from rest_framework import serializers

from .models import MyUser


class UserSerializer(serializers.ModelSerializer):
    """
    serializer custom user model
    """

    class Meta:
        model = MyUser
        editable = False
        fields = ('id', 'email', 'avatar_url')
