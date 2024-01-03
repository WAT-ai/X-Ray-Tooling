import cohere
import os 
from dotenv import load_dotenv
import json
import uuid

class RAGCohere:
    def __init__(self):
        load_dotenv()
        cohere_api_key = os.getenv('COHERE_API_KEY')
        self.co = cohere.Client(cohere_api_key)
        self.dataset = self.load_dataset_map()
        self.conversation_id = None
    
    def load_dataset_map(self):
        with open("datasets/xray_articles.json", "r", encoding='utf-8') as f:
            return json.load(f)
        
    
    def load_article(self, article: dict):
        article_dict = []
        for text in article["FullText"]:
            article_dict.append(
                {
                    "title": article["Title"],
                    "text": text,
                }
            )
        return article_dict
    
    def get_response_via_documents(self, chat_history, message, max_tokens=500):
        documents = []
        max_articles = 5 # just for testing
        for article in self.dataset:
            if max_articles == 0:
                break
            # print(file)
            documents.extend(self.load_article(article))
            max_articles -= 1
        # print(documents)
        print(message)
        response = self.co.chat(
            # preamble_override=("You are a medical assistance chatbot. You will aid patients with injury identification, "
            #                    "care, and recovery practices. Probe the user with further questions in addition to "
            #                    "information relevant to their specific injury. Try to find get the most detailed "
            #                    "diagnosis out of the patient to provide the most acurate information."),
            chat_history=chat_history,
            message=message,
            documents=documents,
            max_tokens=max_tokens,
            prompt_truncation='AUTO',
            conversation_id = str(uuid.uuid4())
        )
        self.conversation_id = response.conversation_id
        return response
    
    def get_response_continuing_conversation(self, message, max_tokens=500):
        response = self.co.chat(
            message=message,
            conversation_id = self.conversation_id,
            prompt_truncation='AUTO',
            max_tokens=max_tokens
        )
        return response

if __name__ == "__main__":
    chat_history=[
        {"role": "USER", "message": "I have had a fracture"},
        {"role": "CHATBOT", "message": "I am here to assist you. Can you tell me more about your fracture?"},
      ]
    message="I fell off while biking and broke my wrist and my upper arm."
    cohere = RAGCohere()
    response = cohere.get_response_via_documents(chat_history, message=message, max_tokens=500)
    print(response.text)

    while True:
        # Get the user message
        message = input("User: ")

        # Typing "quit" ends the conversation
        if message.lower() == "quit" or message.lower() == "q":
            print("Ending chat.")
            break
        else:
            response = cohere.get_response_continuing_conversation(message=message)
            print(response.text)


    