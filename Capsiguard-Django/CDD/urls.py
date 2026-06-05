from django.urls import path, include
from .views import authView, home, j, analyze


urlpatterns = [
	path("", j, name="j"),
	path("home/", home, name="home"),
	path("signup/", authView, name="authView"),
	path("accounts/", include("django.contrib.auth.urls")),
	path("analyze/", analyze, name="analyze"),
]