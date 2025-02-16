from openai import OpenAI
import os
from backend.jobs.utils import api_client as jobs
from backend.jobs.utils.OnetWebService import OnetWebService
from openai import OpenAI

class OpenAIClient:
    # Singleton OpenAI API client to reuse session across views.
    
    _instance = None  # Store a single instance

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