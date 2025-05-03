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

# Set up logger for debugging and error logging
logger = logging.getLogger(__name__)

# Returns a paginated list of the user's previous interviews (both completed and in progress)
class PastInterviewListView(APIView):
    permission_classes = [IsAuthenticated]  # User must be logged in

    def get(self, request):
        try:
            # Get pagination parameters with defaults
            page = int(request.query_params.get('page', 1))
            limit = int(request.query_params.get('limit', 12))

            # Get user's interviews that are either completed or still in progress
            interviews = Interview.objects.filter(
                user=request.user,
                status__in=["IN_PROGRESS", "COMPLETED"]
            ).order_by('-start_time')  # Sort from most recent

            # Paginate the interview list
            paginator = Paginator(interviews, limit)
            page_obj = paginator.get_page(page)

            # Serialize interview data
            serializer = InterviewSerializer(page_obj.object_list, many=True)

            return Response({
                'results': serializer.data,
                'count': paginator.count,
                'page': page_obj.number,
                'total_pages': paginator.num_pages
            })

        except Exception as e:
            logger.error(f"Error in PastInterviewListView: {str(e)}", exc_info=True)
            return Response({"error": "Failed to fetch interviews"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Starts a new interview session for the user with a job title
class StartInterview(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user = request.user
            job_title = request.data.get('job_title')

            # If job title isn't passed, fall back to user profile
            if job_title is None:
                user_profile = user.userprofile
                job_title = user_profile.target_job_title

            if job_title is None:
                return Response({"error": "Job title required for interview creation"}, status=status.HTTP_400_BAD_REQUEST)

            # Try to get existing questions
            questions = list(CSQuestion.objects.filter(job_title__iexact=job_title))

            # If not enough, attempt to generate more
            if len(questions) < 5:
                for _ in range(5):
                    if not createCSQuestion(job_title=job_title):
                        return Response({"error": "Failed to create new questions"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                questions = list(CSQuestion.objects.filter(job_title__iexact=job_title))

            if len(questions) < 5:
                return Response({"error": "Not enough questions available"}, status=400)

            # Randomly choose 5 questions
            selected_questions = random.sample(questions, 5)

            # Create the interview instance
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

# Submits an answer for a specific interview and question, returns AI feedback
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

            # Use OpenAI to get feedback on the response
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
                        "content": "You are an expert technical interviewer. Engage with the candidate as if in a live mock interview, providing direct, friendly, and constructive feedback."
                    },
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.7
            )

            feedback = completion.choices[0].message.content.strip()

            # Save the answer with feedback
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

# Marks the interview as completed and sets the end time
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

# Returns the next unanswered question from an in-progress interview
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

            # Get a random unanswered question
            next_question = interview.questions.exclude(
                id__in=answered_questions
            ).order_by('?').first()

            if not next_question:
                return Response({"message": "No more questions available"}, status=404)

            return Response({
                "id": next_question.id,
                "question": next_question.question_text
            })

        except Interview.DoesNotExist:
            return Response({"error": "No active interview found"}, status=404)
        except Exception as e:
            logger.error(f"Error fetching next question: {str(e)}")
            return Response({"error": "Failed to fetch next question"}, status=500)

# Lets the user rate a question as Like or Dislike
class RateQuestion(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            question_id = request.data.get('question_id')
            interview_id = request.data.get('interview_id')
            rating = request.data.get('rating')

            if not question_id or not interview_id or not rating:
                return Response({"error": "Missing required fields"}, status=400)

            if rating not in ['LIKE', 'DISLIKE']:
                return Response({"error": "Invalid rating value"}, status=400)

            interview = Interview.objects.get(id=interview_id, user=request.user)
            question = CSQuestion.objects.get(id=question_id)

            # Save or update the user's rating
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
            }, status=201 if created else 200)

        except Interview.DoesNotExist:
            return Response({"error": "Interview not found"}, status=404)
        except CSQuestion.DoesNotExist:
            return Response({"error": "Question not found"}, status=404)
        except Exception as e:
            logger.error(f"Error rating question: {str(e)}")
            return Response({"error": "Failed to process rating"}, status=500)

# Submits overall feedback for a completed interview
class SubmitInterviewFeedback(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, interview_id):
        try:
            content = request.data.get('content')
            rating = request.data.get('rating', 0)

            if not content:
                return Response({"error": "Feedback content is required"}, status=400)

            interview = Interview.objects.get(id=interview_id, user=request.user)

            if interview.status != "COMPLETED":
                return Response({"error": "Can only provide feedback for completed interviews"}, status=400)

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
            }, status=201 if created else 200)

        except Interview.DoesNotExist:
            return Response({"error": "Interview not found"}, status=404)
        except Exception as e:
            logger.error(f"Error submitting feedback: {str(e)}")
            return Response({"error": "Failed to submit feedback"}, status=500)

# Gets the current rating the user gave for a specific question in an interview
class GetQuestionRating(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            question_id = request.query_params.get('question_id')
            interview_id = request.query_params.get('interview_id')

            if not question_id or not interview_id:
                return Response({"error": "Missing required parameters"}, status=400)

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
                return Response({"rating": None}, status=200)

        except Exception as e:
            logger.error(f"Error fetching question rating: {str(e)}")
            return Response({"error": "Failed to fetch rating"}, status=500)
