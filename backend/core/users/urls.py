from django.conf.urls import url

from core.users import views as v

urlpatterns = [url(r"^user/$", v.UserDetailsView.as_view(), name="rest_user_details")]
