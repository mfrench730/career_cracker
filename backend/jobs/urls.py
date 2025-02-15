from django.urls import path
from .views import get_info

urlpatterns = [
    path('career_info/', get_info, name='get_career_info'),
]