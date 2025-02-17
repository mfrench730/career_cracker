from rest_framework import serializers
from .models import Interview, InterviewQuestion

# class OpenAIResponseSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = OpenAIQuestion
#         fields = ["id", "openai_response", "created_at"]

class InterviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interview
        fields = ["id", "user_id", "status", "questions", "responses", "feedbacks"]

class InterviewQuestionSerializer(serializers.Serializer):
    class Meta:
        model = InterviewQuestion
        fields = ['id', 'user_id', 'question_id', 'question', 'AI_feedback', 'interview']
