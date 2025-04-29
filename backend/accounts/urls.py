from django.urls import path
from .views import SignUpView, LoginView, protected_view, UserProfileView

# Define URL patterns for the accounts app
urlpatterns = [
    path('signup/', SignUpView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('protected-route/', protected_view, name='protected-route'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
]