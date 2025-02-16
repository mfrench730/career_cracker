from django.urls import path
from . import views

urlpatterns = [
    path('/interviews/questions/next', views.NextQuestion.as_view(), name='next-question'),
    path('/interviews/start', views.StartInterview.as_view(), name='start-interview')
]