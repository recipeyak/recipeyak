"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import include, url
from django.contrib import admin
from django.views.generic import TemplateView

urlpatterns = [
    url(r"^admin/", admin.site.urls),
    url(r"", include("core.urls")),
    url(r"^api-auth/", include("rest_framework.urls", namespace="rest_framework")),
    # we don't actually use this view. This serves as the url for the reset email
    url(
        r"^password-reset/confirm/(?P<uidb64>[0-9A-Za-z_\-]+)\.(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$",
        TemplateView.as_view(template_name="password_reset_confirm.html"),
        name="password_reset_confirm",
    ),
    url(
        r"^signup/$",
        TemplateView.as_view(template_name="socialccount_signup.html"),
        name="socialaccount_signup",
    ),
    url(
        r"^settings/$",
        TemplateView.as_view(template_name="socialaccount_connections.html"),
        name="socialaccount_connections",
    ),
]
