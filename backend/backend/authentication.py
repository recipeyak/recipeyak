from rest_framework.authentication import (
    SessionAuthentication as DRFSessionAuthentication,
)


class SessionAuthentication(DRFSessionAuthentication):
    def enforce_csrf(self, request):
        """
        We don't use CSRF tokens to prevent CSRF attacks. Instead we use
        SameSite: Lax in our cookies.

        see: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
        """
        return
