from django.urls import path
from . import views

urlpatterns = [
    path('interviews/questions/next', views.NextQuestion.as_view(), name='next-question'),
    path('interviews/start', views.StartInterview.as_view(), name='start-interview'),
    path('interviews/<int:sessionId>/complete', views.CompleteInterview.as_view(), name='complete_interview'),
    path('interviews/<int:sessionId>/submit', views.SubmitAnswer.as_view(), name='submit_answer'),
    path('interviews/history', views.PastInterviewListView.as_view(), name='history'),

]