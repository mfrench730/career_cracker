from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.views import APIView
from django.http import JsonResponse
from interviews.utils.api_client import OpenAIClient
from .models import Interview, InterviewQuestion
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from .serializers import InterviewSerializer, InterviewQuestionSerializer
from rest_framework.pagination import PageNumberPagination
import os

api_key = os.environ.get("OPENAI_KEY")
openai_client = OpenAIClient().get_client()  # reuse the singleton instance

# TODO: reed to get relevant user target career to use with prompt


# GET /interviews/questions/next
class NextQuestion(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        # get ongoing interview
        try:
            interview = Interview.objects.get(user=user, status="IN_PROGRESS")
        except Interview.DoesNotExist:
            return Response({"error": "No active interview found"}, status=status.HTTP_404_NOT_FOUND)
        
        # generate question
        question = openai_client.generate_question(user, "Software Engineering")

        interview.questions.append(question)
        interview.save()

        return Response({"question": question}, status=status.HTTP_200_OK)


# POST /interviews/start
class StartInterview(APIView):
    permission_classes = [IsAuthenticated]  # Requires authentication

    def post(self, request):
        user = request.user  # Get the authenticated user

        # Create a new interview for the user
        interview = Interview.objects.create(user=user)

        # Serialize the interview data
        serializer = InterviewSerializer(interview)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


# POST /interviews/{sessionId}/complete
class CompleteInterview(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        # get ongoing interview
        try:
            interview = Interview.objects.get(user=user, status="IN_PROGRESS")
        except Interview.DoesNotExist:
            return Response({"error": "No active interview found"}, status=status.HTTP_404_NOT_FOUND)
        
        interview.status = "COMPLETED"
        interview.save()

        serializer = InterviewSerializer(interview)

        return Response(serializer.data, status=status.HTTP_200_OK)

# POST /interviews/{sessionId}/submit
class SubmitAnswer(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        question_id = request.data.get("questionId")
        text = request.data.get("text")

        if not question_id or text:
            return Response({"error": "Error fetching question"}, status=status.HTTP_400_BAD_REQUEST)

        # get ongoing interview
        try:
            interview = Interview.objects.get(user=user, status="IN_PROGRESS")
        except Interview.DoesNotExist:
            return Response({"error": "No active interview found"}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            interview_question = InterviewQuestion.objects.get(interview=interview, question_id=question_id)
        except InterviewQuestion.DoesNotExist:
            return Response({"error": "Question not found in this interview"}, status=status.HTTP_404_NOT_FOUND)
        
        # get feedback on answer
        feedback = open_ai.get_feedback(text)

        interview_question.AI_feedback = feedback
        interview_question.save()

        serializer = InterviewQuestionSerializer(interview_question)

        return Response(serializer.data, status=status.HTTP_200_OK)



# GET /interviews/history?page=1&limit=10
class GetHistory(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user


# Custom pagination class to handle paginated responses
class InterviewPagination(PageNumberPagination):
    page_size = 10  # Number of interviews per page
    page_size_query_param = 'page_size'
    max_page_size = 100


class PastInterviewListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = InterviewSerializer
    pagination_class = InterviewPagination

    def get_queryset(self):
        # Get the user (authenticated user)
        user = self.request.user

        # Filter interviews by user and completed status (e.g., "COMPLETED" status)
        return Interview.objects.filter(user=user, status="COMPLETED").order_by('-start_time')

    def list(self, request):
        # get the paginated queryset
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)

            # custom response to add questions, responses, and feedback
            interviews_data = []
            for interview in serializer.data:
                interview_data = {
                    "id": interview["id"],
                    "date": interview["start_time"],
                    "questions": []
                }

                # fetch the questions for the interview
                interview_obj = Interview.objects.get(id=interview["id"])
                interview_questions = InterviewQuestion.objects.filter(interview=interview_obj)

                for question in interview_questions:
                    question_data = {
                        "question": question.question,
                        "response": question.response,
                        "feedback": question.AI_feedback
                    }
                    interview_data["questions"].append(question_data)

                interviews_data.append(interview_data)

            # return the paginated interviews with questions and feedback
            return self.get_paginated_response(interviews_data)
        return Response({"error": "No interviews found"}, status=status.HTTP_404_NOT_FOUND)
