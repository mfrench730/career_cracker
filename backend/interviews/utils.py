from rest_framework.response import Response
from rest_framework import status
from jobs.utils.OnetWebService import OnetWebService
from jobs.utils import api_client
from .serializers import CSQuestionSerializer
from django.conf import settings
import os
import openai
import logging

# Set up logger for tracking errors
logger = logging.getLogger(__name__)

# This function generates a CS interview question based on a job title
def createCSQuestion(job_title):
    job_title = job_title.lower()  # Normalize input

    try:
        # Connect to O*NET web service using credentials from environment
        onet_ws = OnetWebService(os.environ.get("ONET_USERNAME"), os.environ.get("ONET_PASSWORD"))

        # Get the SOC code for the job title (used to identify roles in O*NET)
        soc_code = api_client.get_soc_code(job_title, onet_ws)

        # Pull job description and task info based on the SOC code
        description = api_client.get_job_info(soc_code, onet_ws)
        tasks = api_client.get_tasks(soc_code, onet_ws)

        # Set up OpenAI client with secret API key
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

        # Create a prompt combining the job info to guide the AI in generating a question
        prompt = f"""
            Imagine you are conducting an interview and must ask the candidate a question that relates to one or more items from the following job description
            and list of tasks.

            Job Description: {description}

            Job Tasks: {tasks}

            Question: 
        """

        # Ask OpenAI to generate a mock interview question
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
        
        # Extract the AI-generated question text
        question_text = completion.choices[0].message.content.strip()

        # Build a dictionary to create a new CSQuestion object
        data = {
            "question_text": question_text,
            "job_title": job_title,
            "category": "NUL",  # Defaulted to 'None' since it's generated
            "difficulty": 1     # Default difficulty level
        }

        # Serialize and save the question
        question = CSQuestionSerializer(data=data)
        if question.is_valid():
            question.save()
            return True
        else:
            # Log if serializer fails validation
            logger.error(f"Error: {question.errors}")
            raise Exception(f"Question Serializer Error: {question.errors}")

    except Exception as e:
        # Catch anything that goes wrong and log it
        logger.error(f"Error creating CS question: {e}")
        raise e
