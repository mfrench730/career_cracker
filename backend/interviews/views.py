# interviews/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
import logging
import random
import openai
from django.conf import settings
from .models import Interview, CSQuestion, InterviewAnswer
from .serializers import InterviewSerializer
from django.core.paginator import Paginator

logger = logging.getLogger(__name__)

# Add this view class
class PastInterviewListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            page = int(request.query_params.get('page', 1))
            limit = int(request.query_params.get('limit', 10))
            
            interviews = Interview.objects.filter(
                user=request.user,
                status="COMPLETED"
            ).order_by('-start_time')
            
            paginator = Paginator(interviews, limit)
            page_obj = paginator.get_page(page)
            
            serializer = InterviewSerializer(page_obj.object_list, many=True)
            
            return Response({
                'results': serializer.data,
                'count': paginator.count,
                'page': page_obj.number,
                'total_pages': paginator.num_pages
            })
            
        except Exception as e:
            logger.error(f"Error in PastInterviewListView: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to fetch interviews"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class StartInterview(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Get 5 random questions
            questions = list(CSQuestion.objects.all())
            if len(questions) < 5:
                return Response({"error": "Not enough questions available"}, status=400)
            
            selected_questions = random.sample(questions, 5)
            
            # Create interview
            interview = Interview.objects.create(user=request.user)
            interview.questions.set(selected_questions)
            
            return Response({
                "interview_id": interview.id,
                "questions": [q.question_text for q in selected_questions]
            }, status=201)
            
        except Exception as e:
            logger.error(f"Error starting interview: {str(e)}")
            return Response({"error": "Failed to start interview"}, status=500)

class SubmitAnswer(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, interview_id):
        try:
            interview = Interview.objects.get(id=interview_id, user=request.user)
            question_id = request.data.get('question_id')
            response_text = request.data.get('response')
            
            question = CSQuestion.objects.get(id=question_id)
            
            # Get AI feedback
            openai.api_key = settings.OPENAI_API_KEY
            prompt = f"""Provide concise feedback for this coding interview response.
            
            Question: {question.question_text}
            Response: {response_text}
            
            Feedback:"""
            
            ai_response = openai.Completion.create(
                engine="text-davinci-003",
                prompt=prompt,
                max_tokens=150,
                temperature=0.7
            )
            
            feedback = ai_response.choices[0].text.strip()
            
            # Save answer
            InterviewAnswer.objects.create(
                interview=interview,
                question=question,
                user_response=response_text,
                ai_feedback=feedback
            )
            
            return Response({"feedback": feedback})
            
        except Interview.DoesNotExist:
            return Response({"error": "Interview not found"}, status=404)
        except Exception as e:
            logger.error(f"Error submitting answer: {str(e)}")
            return Response({"error": "Failed to process answer"}, status=500)

class CompleteInterview(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, interview_id):
        try:
            interview = Interview.objects.get(id=interview_id, user=request.user)
            interview.status = "COMPLETED"
            interview.end_time = timezone.now()
            interview.save()
            return Response({"status": "completed"})
        except Interview.DoesNotExist:
            return Response({"error": "Interview not found"}, status=404)