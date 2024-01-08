import cohere
import os 
from dotenv import load_dotenv
import json

class RAGCohere:
    def __init__(self):
        load_dotenv()
        cohere_api_key = os.getenv('COHERE_API_KEY')
        self.co = cohere.Client(cohere_api_key)
        self.dataset_map = self.load_dataset_map()
    
    def load_dataset_map(self):
        with open("datasets/datasets_map.json", "r") as f:
            return json.load(f)
        
    
    def load_dataset(self, dataset_name: str):
        with open(f"datasets/{dataset_name}", "r") as f:
            return {
                "title": dataset_name,
                "text": f.read(),
            }
    
    def get_response_via_documents(self, chat_history, message, max_tokens=500):
        documents = []
        for file in self.dataset_map:
            # print(file)
            documents.append(self.load_dataset(self.dataset_map[file]))
        # print(documents)
        print(message)
        response = self.co.chat(
            chat_history=chat_history,
            message=message,
            documents=documents,
            max_tokens=max_tokens,
            prompt_truncation='AUTO'
        )
        return response
    
    def get_response_via_web_search(self, chat_history, message, max_tokens=500):
        response = self.co.chat(
            chat_history=chat_history,
            message=message,
            connectors=[{"id": "web-search"}],
            max_tokens=max_tokens,
            prompt_truncation='AUTO'
        )
        return response

if __name__ == "__main__":
    chat_history=[
        {"role": "USER", "message": "I have had a fracture"},
        {"role": "CHATBOT", "message": "I am here to assist you. Can you tell me more about your fracture?"},
      ]
    message="I fell off while biking and broke two bones."
    cohere = RAGCohere()
    response = cohere.get_response_via_documents(chat_history, message=message, max_tokens=500)
    print(response.text)
    