# accounts/urls.py
from django.urls import path
from .views import SignUpView, LoginView
from .views import SignInView, protected_view#just added it 



urlpatterns = [
    path('signup/', SignUpView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path("signin/", SignInView.as_view(), name="signin"),#just added it
    path("protected-route/", protected_view, name="protected-route"),
    path("signup/", SignUpView.as_view(), name="signup"),

]
