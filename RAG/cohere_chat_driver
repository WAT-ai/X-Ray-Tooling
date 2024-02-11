import os
from dotenv import load_dotenv
import cohere
from cohere_pubmed_RAG_v2 import Chatbot, Documents

def main():
    # Load environment variables
    load_dotenv()

    # Initialize Cohere API client
    cohere_api_key = os.getenv('COHERE_API_KEY')
    co = cohere.Client(cohere_api_key)

    # Initialize documents
    docs = Documents(sources=None, co=co)

    # Initialize chatbot
    chatbot = Chatbot(docs=docs, co=co)

    # Start conversation loop
    while True:
        user_input = input("User: ")

        if user_input.lower() in ['quit', 'q']:
            print("Ending chat.")
            break

        # Generate response from chatbot
        response = chatbot.generate_response(user_input, max_tokens=500)
        print("Chatbot:", response.text)

if __name__ == "__main__":
    main()
