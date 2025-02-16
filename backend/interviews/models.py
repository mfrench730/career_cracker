from django.db import models
from accounts.models import UserProfile

# for question from OpenAI
class OpenAIQuestion(models.Model):
    # Model to store OpenAI API responses.
    openai_response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

# for user information with question
class InterviewQuestion(models.Model):
    user_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    question_id = models.IntegerField() # generated from serializer OpenAIResponseSerializer
    response = models.TextField()
    AI_feedback = models.TextField()

class Interview(models.Model):
    STATUS_CHOICES = [
        ("IN_PROGRESS", "In Progress"),
        ("COMPLETED", "Completed"),
    ]

    user_id = models.IntegerField()
    start_time = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="IN_PROGRESS")
    questions = models.JSONField(default=list)
    responses = models.JSONField(default=list)
    feedbacks = models.JSONField(default=list)
