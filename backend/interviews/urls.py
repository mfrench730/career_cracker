from django.urls import path
from . import views

urlpatterns = [
    path('start/', views.StartInterview.as_view(), name='start_interview'),
    path('questions/next/', views.NextQuestionView.as_view(), name='next_question'),
    path('<int:interview_id>/submit/', views.SubmitAnswer.as_view(), name='submit_answer'),
    path('<int:interview_id>/complete/', views.CompleteInterview.as_view(), name='complete_interview'),
    path('history/', views.PastInterviewListView.as_view(), name='interview_history'),
    path('question/rate/', views.RateQuestion.as_view(), name='rate_question'),
    path('<int:interview_id>/feedback/', views.SubmitInterviewFeedback.as_view(), name='submit_feedback'),
    path('question/rating/', views.GetQuestionRating.as_view(), name='get_question_rating'),
]