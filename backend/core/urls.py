from django.conf.urls import url, include

urlpatterns = [
    # django-rest-auth related urls
    url(r'^rest-auth/', include('rest_auth.urls')),
    url(r'^rest-auth/registration/', include('rest_auth.registration.urls'))
    # url(r'cart'),
    # url(r'recipes'),
]
