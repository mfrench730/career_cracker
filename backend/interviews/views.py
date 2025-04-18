from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
import logging
import random
import openai
from django.conf import settings
from .models import Interview, CSQuestion, InterviewAnswer, QuestionRating, InterviewFeedback
from .serializers import InterviewSerializer, CSQuestionSerializer
from django.core.paginator import Paginator
from jobs.utils.OnetWebService import OnetWebService
from .utils import createCSQuestion
import os

logger = logging.getLogger(__name__)

class PastInterviewListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            page = int(request.query_params.get('page', 1))
            limit = int(request.query_params.get('limit', 12))
            
            interviews = Interview.objects.filter(
                user=request.user,
                status__in=["IN_PROGRESS", "COMPLETED"]
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
            user = request.user
            job_title = request.data.get('job_title', None)

            if job_title is None:
                user_profile = user.userprofile
                job_title = user_profile.target_job_title

            if job_title is None:
                return Response({"error": "Job title required for interview creation"}, status=status.HTTP_400_BAD_REQUEST)

            questions = list(CSQuestion.objects.filter(job_title__iexact=job_title))

            if len(questions) < 5:
                for _ in range(5):
                    if not createCSQuestion(job_title=job_title):
                      return Response({"error": "Failed to create new questions"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                questions = list(CSQuestion.objects.filter(job_title__iexact=job_title))

            if len(questions) < 5:
                return Response({"error": "Not enough questions available"}, status=400)

            selected_questions = random.sample(questions, 5)
            
            interview = Interview.objects.create(
                user=request.user,
                job_title=job_title,
                status="IN_PROGRESS"
            )
            interview.questions.set(selected_questions)
            
            return Response({
                "id": interview.id,
                "status": interview.status,
                "start_time": interview.start_time,
            }, status=201)
            
        except Exception as e:
            logger.error(f"Error starting interview: {str(e)}")
            return Response({"error": "Failed to start interview"}, status=500)

class SubmitAnswer(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, interview_id):
        try:
            interview = Interview.objects.get(id=interview_id, user=request.user)
            question_id = request.data.get('questionId')
            response_text = request.data.get('text')
            
            if not question_id or not response_text:
                return Response({"error": "Missing question ID or response text"}, status=400)
            
            question = CSQuestion.objects.get(id=question_id)
            
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            
            prompt = f"""
            Imagine you're conducting a live mock interview. The candidate has just answered the following coding question. Please provide personalized, conversational feedback as if you're speaking directly to the candidate. Highlight what they did well, identify areas for improvement, and offer specific suggestions to help them progress.

            Question: {question.question_text}

            Candidate Response: {response_text}

            Feedback:
            """
                        
            completion = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system", 
                        "content": (
                            "You are an expert technical interviewer. Engage with the candidate as if in a live mock interview, providing direct, friendly, and constructive feedback."
                        )
                    },
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.7
            )
            
            feedback = completion.choices[0].message.content.strip()
            
            answer = InterviewAnswer.objects.create(
                interview=interview,
                question=question,
                user_response=response_text,
                ai_feedback=feedback
            )
            
            answered_count = InterviewAnswer.objects.filter(interview=interview).count()
            
            return Response({
                "id": answer.id,
                "question_text": question.question_text,
                "user_response": response_text,
                "ai_feedback": feedback,
                "created_at": answer.created_at,
                "question_number": answered_count
            })
            
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

class NextQuestionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            interview = Interview.objects.filter(
                user=request.user,
                status="IN_PROGRESS"
            ).latest('start_time')

            answered_questions = InterviewAnswer.objects.filter(
                interview=interview
            ).values_list('question_id', flat=True)

            next_question = interview.questions.exclude(
                id__in=answered_questions
            ).order_by('?').first()

            if not next_question:
                return Response(
                    {"message": "No more questions available"},
                    status=status.HTTP_404_NOT_FOUND
                )

            return Response({
                "id": next_question.id,
                "question": next_question.question_text
            })

        except Interview.DoesNotExist:
            return Response(
                {"error": "No active interview found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error fetching next question: {str(e)}")
            return Response(
                {"error": "Failed to fetch next question"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class RateQuestion(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            question_id = request.data.get('question_id')
            interview_id = request.data.get('interview_id')
            rating = request.data.get('rating')
            
            if not question_id or not interview_id or not rating:
                return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
            
            if rating not in ['LIKE', 'DISLIKE']:
                return Response({"error": "Invalid rating value"}, status=status.HTTP_400_BAD_REQUEST)
            
            interview = Interview.objects.get(id=interview_id, user=request.user)
            question = CSQuestion.objects.get(id=question_id)
            
            rating_obj, created = QuestionRating.objects.update_or_create(
                user=request.user,
                question=question,
                interview=interview,
                defaults={'rating': rating}
            )
            
            return Response({
                "id": rating_obj.id,
                "rating": rating_obj.rating,
                "created_at": rating_obj.created_at
            }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
            
        except Interview.DoesNotExist:
            return Response({"error": "Interview not found"}, status=status.HTTP_404_NOT_FOUND)
        except CSQuestion.DoesNotExist:
            return Response({"error": "Question not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error rating question: {str(e)}")
            return Response({"error": "Failed to process rating"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SubmitInterviewFeedback(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, interview_id):
        try:
            content = request.data.get('content')
            rating = request.data.get('rating', 0)
            
            if not content:
                return Response({"error": "Feedback content is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            interview = Interview.objects.get(id=interview_id, user=request.user)
            
            if interview.status != "COMPLETED":
                return Response({"error": "Can only provide feedback for completed interviews"}, 
                               status=status.HTTP_400_BAD_REQUEST)
            
            feedback, created = InterviewFeedback.objects.update_or_create(
                interview=interview,
                defaults={
                    'content': content,
                    'rating': rating
                }
            )
            
            return Response({
                "id": feedback.id,
                "content": feedback.content,
                "rating": feedback.rating,
                "created_at": feedback.created_at
            }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
            
        except Interview.DoesNotExist:
            return Response({"error": "Interview not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error submitting feedback: {str(e)}")
            return Response({"error": "Failed to submit feedback"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class GetQuestionRating(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            question_id = request.query_params.get('question_id')
            interview_id = request.query_params.get('interview_id')
            
            if not question_id or not interview_id:
                return Response({"error": "Missing required parameters"}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                rating = QuestionRating.objects.get(
                    user=request.user,
                    question_id=question_id,
                    interview_id=interview_id
                )
                
                return Response({
                    "id": rating.id,
                    "rating": rating.rating,
                    "created_at": rating.created_at
                })
            except QuestionRating.DoesNotExist:
                return Response({"rating": None}, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Error fetching question rating: {str(e)}")
            return Response({"error": "Failed to fetch rating"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
