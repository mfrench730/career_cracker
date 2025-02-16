from rest_framework import serializers
from models import OpenAIQuestion, Interview

class OpenAIResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpenAIQuestion
        fields = ["id", "openai_response", "created_at"]

class InterviewSerializer(serializers.ModelSerializer):
    

    class Meta:
        model = Interview
        fields = ["id", "user_id", "status", "questions", "responses", "feedbacks"]


