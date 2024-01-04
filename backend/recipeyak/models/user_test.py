import pytest

from recipeyak.models import User
from recipeyak.models.user import get_avatar_url

pytestmark = pytest.mark.django_db


def test_create_user() -> None:
    """
    Ensure that password is hashed and email is set
    """
    email = "john@doe.org"
    password = "testing123"
    user = User.objects.create(email=email)
    user.set_password(password)
    user.save()
    assert user.password != password
    assert user.email == email


def test_avatar_url(user: User) -> None:
    """
    User's avatar url should not change
    """
    assert (
        get_avatar_url(
            email=user.email,
            profile_upload_key=user.profile_upload.key
            if user.profile_upload is not None
            else None,
        )
        == "/avatar/bc6a715808d9aae0ddeefb1e47e482a6?d=identicon&r=g"
    )
