from rest_framework import serializers
from .models import Interview, CSQuestion, InterviewAnswer, QuestionRating, InterviewFeedback

# Serializer for CSQuestion model – exposes selected fields to the API
class CSQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CSQuestion
        fields = ['id', 'question_text', 'job_title', 'category', 'difficulty']

# Serializer for rating a question (like/dislike)
class QuestionRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionRating
        fields = ['id', 'rating', 'created_at']

# Serializer for a single answer in an interview, includes question text and user's rating
class InterviewAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text')  # pulls question text from FK
    rating = serializers.SerializerMethodField()  # custom field to get rating info

    class Meta:
        model = InterviewAnswer
        fields = ['id', 'question_text', 'user_response', 'ai_feedback', 'created_at', 'rating']

    # Tries to get the current user's rating for this specific question+interview combo
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

# Serializer for feedback left by the user after the interview is done
class InterviewFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewFeedback
        fields = ['id', 'content', 'rating', 'created_at']

# Main serializer for the Interview model – includes questions, answers, and feedback
class InterviewSerializer(serializers.ModelSerializer):
    answers = InterviewAnswerSerializer(many=True, read_only=True)  # Nested list of all answers
    questions = CSQuestionSerializer(many=True, read_only=True)    # Nested list of all questions
    feedback = InterviewFeedbackSerializer(read_only=True)         # One-to-one feedback, if available

    class Meta:
        model = Interview
        fields = ['id', 'start_time', 'end_time', 'status', 'questions', 'answers', 'feedback']
