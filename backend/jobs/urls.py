from django.urls import path
from . import views

urlpatterns = [
    path('career_info/', views.get_info_view.as_view(), name='Get Career Info'),
]