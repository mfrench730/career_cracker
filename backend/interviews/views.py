from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from django.http import JsonResponse
from backend.jobs.utils import api_client as open_ai
from models import OpenAIQuestion, Interview
from django.utils import timezone
from serializers import OpenAIResponseSerializer, InterviewSerializer
import os

api_key = os.environ.get("OPENAI_KEY")
openai_client = open_ai(api_key).get_client()  # Reuse the singleton instance

# TODO: Need to get relevant user target career to use with prompt

# GET /interviews/questions/next
@api_view(["GET"])
def NextQuestion(request):
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": "Ask me an interview question relating to computer science and IT."}]
    )
    return JsonResponse(response.model_dump())

# POST /interviews/start
@api_view(["POST"])
def StartInterview(request):
    user_id = request.data.get('user')

    if not user_id:
        return Response({"error": "login is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    interview = Interview.objects.create(
        user_id = user_id,
        start_time = timezone.now(),
        questions=[],
        responses=[],
        feedbacks=[]
    )

    serializer = InterviewSerializer(interview)

    return Response(serializer.data, status=status.HTTP_201_CREATED)


# POST /interviews/{sessionId}/complete

# POST /interviews/{sessionId}/submit

# GET /interviews/history?page=1&limit=10

# POST /interviews/transcribe