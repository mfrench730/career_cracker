from rest_framework import serializers
from .models import Interview, CSQuestion, InterviewAnswer, QuestionRating, InterviewFeedback

class CSQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CSQuestion
        fields = ['id', 'question_text', 'job_title', 'category', 'difficulty']

class QuestionRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionRating
        fields = ['id', 'rating', 'created_at']

class InterviewAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text')
    rating = serializers.SerializerMethodField()
    
    class Meta:
        model = InterviewAnswer
        fields = ['id', 'question_text', 'user_response', 'ai_feedback', 'created_at', 'rating']
    
    def get_rating(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
            
        rating = QuestionRating.objects.filter(
            user=request.user,
            question=obj.question,
            interview=obj.interview
        ).first()
        
        if not rating:
            return None
            
        return QuestionRatingSerializer(rating).data

class InterviewFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewFeedback
        fields = ['id', 'content', 'rating', 'created_at']

class InterviewSerializer(serializers.ModelSerializer):
    answers = InterviewAnswerSerializer(many=True, read_only=True)
    questions = CSQuestionSerializer(many=True, read_only=True)
    feedback = InterviewFeedbackSerializer(read_only=True)
    
    class Meta:
        model = Interview
        fields = ['id', 'start_time', 'end_time', 'status', 'questions', 'answers', 'feedback']