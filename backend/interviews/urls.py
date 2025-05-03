from django.urls import path
from . import views

# These are all the API endpoints for the interview-related features
urlpatterns = [
    # Starts a new interview session
    path('start/', views.StartInterview.as_view(), name='start_interview'),

    # Gets the next question in the current interview
    path('questions/next/', views.NextQuestionView.as_view(), name='next_question'),

    # Submits the user's answer to a question
    path('<int:interview_id>/submit/', views.SubmitAnswer.as_view(), name='submit_answer'),

    # Marks the interview as complete (sets end time and status)
    path('<int:interview_id>/complete/', views.CompleteInterview.as_view(), name='complete_interview'),

    # Returns a list of all past interviews for the user
    path('history/', views.PastInterviewListView.as_view(), name='interview_history'),

    # Allows user to rate a question (like/dislike)
    path('question/rate/', views.RateQuestion.as_view(), name='rate_question'),

    # Lets the user submit overall feedback after finishing the interview
    path('<int:interview_id>/feedback/', views.SubmitInterviewFeedback.as_view(), name='submit_feedback'),

    # Gets the current rating for a specific question+interview combo
    path('question/rating/', views.GetQuestionRating.as_view(), name='get_question_rating'),
]
