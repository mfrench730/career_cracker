# interviews/serializers.py
from rest_framework import serializers
from .models import Interview, CSQuestion, InterviewAnswer

class CSQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CSQuestion
        fields = ['id', 'question_text', 'job_title', 'category', 'difficulty']

class InterviewAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text')
    
    class Meta:
        model = InterviewAnswer
        fields = ['id', 'question_text', 'user_response', 'ai_feedback', 'created_at']

class InterviewSerializer(serializers.ModelSerializer):
    answers = InterviewAnswerSerializer(many=True, read_only=True)
    questions = CSQuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Interview
        fields = ['id', 'start_time', 'end_time', 'status', 'questions', 'answers']