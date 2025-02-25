from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class OpenAIClient:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            api_key = os.environ.get("OPENAI_KEY")
            if not api_key:
                raise ValueError("OpenAI API key is not set in environment variables")
            
            cls._instance = super(OpenAIClient, cls).__new__(cls)
            cls._instance.client = OpenAI(api_key=api_key)
        return cls._instance

    def get_client(self):
        return self.client

    def generate_question(self, user, career_field):
        try:
            # Update to use the new OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a human resources worker with moderate technical experience; ask pointed, open-ended, questions."},
                    {"role": "user", "content": f"Generate an interview question related to {career_field}"}
                ],
                max_tokens=75
            )

            # Access the response differently with new API
            question = response.choices[0].message.content.strip()
            return question
        
        except Exception as e:
            print(f"Error generating question: {e}")
            return f"Tell me about your experience in {career_field}"

    def get_feedback(self, user_response):
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an AI career coach providing constructive feedback."},
                    {"role": "user", "content": f"Provide professional feedback for the following interview response: {user_response}"}
                ],
                max_tokens=150
            )

            feedback = response.choices[0].message.content.strip()
            return feedback
        
        except Exception as e:
            print(f"Error generating feedback: {e}")
            return "Thank you for your response. Consider providing more specific details and examples in future interviews."