from rest_framework.response import Response
from rest_framework import status
from jobs.utils.OnetWebService import OnetWebService
from jobs.utils import api_client
from .serializers import CSQuestionSerializer
from django.conf import settings
import os
import openai
import logging

logger = logging.getLogger(__name__)

def createCSQuestion(job_title):
    job_title = job_title.lower()

    try:
        onet_ws = OnetWebService(os.environ.get("ONET_USERNAME"), os.environ.get("ONET_PASSWORD"))
        soc_code = api_client.get_soc_code(job_title, onet_ws)

        description = api_client.get_job_info(soc_code, onet_ws)
        tasks = api_client.get_tasks(soc_code, onet_ws)

        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

        prompt = f"""
            Imagine you are conducting an interview and must ask the candidate a question that relates to one or more items from the following job description
            and list of tasks.

            Job Description: {description}

            Job Tasks: {tasks}

            Question: 
        """

        completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system", 
                "content": (
                    "You are an expert technical interviewer. Engage with the candidate as if in a live mock interview, asking a direct, friendly, and constructive question about computer science and technical concepts."
                )
            },
            {"role": "user", "content": prompt}
        ],
        max_tokens=150,
        temperature=0.7
        )
        
        question_text = completion.choices[0].message.content.strip()

        # DEBUG
        print(question_text)

        data = {
            "question_text": question_text,
            "job_title": job_title,
            "category": "NUL",
            "difficulty": 1
        }

        question = CSQuestionSerializer(data=data)
        if question.is_valid():
            question.save()
            return True
        else:
            logger.error(f"Error: {question.errors}")
            raise Exception(f"Question Serializer Error: {question.errors}")

    except Exception as e:
        logger.error(f"Error creating CS question: {e}")
        raise e
