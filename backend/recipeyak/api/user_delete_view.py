from django.contrib.auth import logout

from recipeyak.api.base.decorators import endpoint
from recipeyak.api.base.request import AuthedHttpRequest
from recipeyak.api.base.response import JsonResponse


@endpoint()
def user_delete_view(request: AuthedHttpRequest) -> JsonResponse:
    user = request.user
    logout(request)
    user.delete()
    return JsonResponse(status=204)
