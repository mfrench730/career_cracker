from openai import OpenAI
import openai
import os
from jobs.utils import api_client as jobs
from jobs.utils.OnetWebService import OnetWebService


class OpenAIClient:
    # Singleton OpenAI API client to reuse session across views.
    
    _instance = None  # Store a single instance

    onet_ws = OnetWebService(username=os.environ.get("ONET_USERNAME"), password=os.environ.get("ONET_PASSWORD"))

    conversation_history = [
    {"role": "system", "content": "You are a human resources worker with moderate technical experience; ask pointed, open-ended, questions."}
    ]

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(OpenAIClient, cls).__new__(cls)
            cls._instance.client = OpenAI(api_key=os.environ.get("OPENAI_KEY"))  # Create the OpenAI client
        return cls._instance

    def get_client(self):
        return self.client  # Return the OpenAI client instance
    
    def generate_question(self, user_career, onet_ws=onet_ws):

        # need user career stored to get field-specific questions
        # career_description = jobs.get_job_info(user_career, onet_ws)
        # career_tasks = jobs.get_tasks(user_career, onet_ws)

        try:
            response = openai.ChatCompletion.create(
                model="gpt-4o-mini", 
                messages=self.conversation_history,
                max_tokens=75  # adjust as needed
            )

            question = response['choices'][0]['message']['content'].strip()
            return question
        
        except openai.error.OpenAIError as e:
            return f"Error generating question: {e}"

    def get_feedback(self, user_response):
        # openai_client = OpenAIClient()
        response = openai.get_client().completions.create(
            model="gpt-3.5-turbo",
            prompt=f"Provide feedback for the following user response: {user_response}",
            max_tokens=100
        )
        return response.choices[0].text.strip()






# client = OpenAI(
#   api_key="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"
# )

# conversation_history = [
#     {"role": "system", "content": "You are a human resources worker with moderate technical experience; ask pointed, open-ended, questions."}
# ]

# def start_interview(description, tasks):
#     input = f"Ask me a an interview question on one of the following topics: {description} {tasks}"

#     conversation_history.append({"role": "user", "content": input})

#     response = client.chat.completions.create(
#         model="gpt-4o-mini",
#         messages=conversation_history
#     )

#     ai_reply = response.choices[0].message.content
#     conversation_history.append({"role": "assistant", "content": ai_reply})

#     return conversation_history