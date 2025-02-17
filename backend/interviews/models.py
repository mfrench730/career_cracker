from django.db import models
from accounts.models import UserProfile

# future use to store questions with category
# # for question from OpenAI
# class OpenAIQuestion(models.Model):
#     # Model to store OpenAI API responses.
#     openai_response = models.TextField()
#     created_at = models.DateTimeField(auto_now_add=True)

class Interview(models.Model):
    STATUS_CHOICES = [
        ("IN_PROGRESS", "In Progress"),
        ("COMPLETED", "Completed"),
    ]

    user = models.TextField()
    start_time = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="IN_PROGRESS")
    question_list = models.JSONField(default=list)

# for user information with question
class InterviewQuestion(models.Model):
    user_id = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    question_id = models.IntegerField() # generated from serializer OpenAIResponseSerializer
    question = models.TextField()
    user_response = models.TextField()
    AI_feedback = models.TextField()
    in_interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name="questions")