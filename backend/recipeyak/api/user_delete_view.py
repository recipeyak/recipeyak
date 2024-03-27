from django.contrib.auth import logout

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest


@endpoint()
def user_delete_view(request: AuthedHttpRequest, params: None) -> None:
    user = request.user
    logout(request)
    user.delete()
