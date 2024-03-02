from cohere import Client
import os
from langchain_openai import OpenAI
from langchain.chains.question_answering import load_qa_chain
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_core.prompts import ChatPromptTemplate
from langchain.docstore.document import Document
import uuid
import argparse
import dotenv
from chroma_embedding import ChromaEmbedding
from index_embedding import IndexEmbedding
from abc import ABC, abstractmethod
from flows import FlowType, Flow
import langchain
from langchain_community.llms import Cohere
from operator import itemgetter


# For Testing Purposes...
langchain.debug = True


class Chain:

    def format_documents(docs: list[Document]):
        formatted = [
            f"Relevant Document {i}:\n{doc.page_content}" for i, doc in enumerate(docs)]

        return "\n\n".join(formatted)

    @classmethod
    def get_chain(cls, llm_client: object):
        prompt = ChatPromptTemplate.from_template(Flow.root())
        chain = (
            {"template": itemgetter("template"), "documents": itemgetter(
                "documents") | RunnableLambda(cls.format_documents)}
            | prompt
            | llm_client
        )
        return chain


class Chat(ABC):
    @abstractmethod
    def query(self, query) -> object:
        """
        run query through the chat to get a response with rag
        """
        pass

    @abstractmethod
    def end_chat(self) -> None:
        """
        Cleans up resources
        """
        pass


class Cohere_LLM(Chat):
    """
    A class that integrates with the Cohere API for conversational AI purposes.

    Attributes:
        __cohere_key (str): API key for Cohere.
        __co (Client): Cohere client initialized with the API key.
        __conversation_id (str): Unique ID for tracking the conversation.
        __embedding Union(IndexEmbedding, ChromaEmbedding): an embedding system for the RAG to use
        __max_tokens int: max number of tokns a response to a query can be
    """
    dotenv.load_dotenv()
    __cohere_key = os.getenv('COHERE_API_KEY')
    __co = Client(__cohere_key)
    __conversation_id = str(uuid.uuid4())

    def __init__(self, chroma_embedding=True, use_openai=False, chunking_max_tokens=100, num_matches=5, max_tokens=500, dataset_path="RAG/datasets/"):
        """
        Initializes the Cohere class, setting up the embedding model used for queries.

        Args:
            chroma_embedding (bool): Flag to decide between using ChromaEmbedding or IndexEmbedding.
            use_openai (bool): Determines if OpenAI embeddings should be used vs huggingface.
            chunking_max_tokens (int): Maximum number of tokens for chunking in IndexEmbedding.
            num_matches (int): Number of matching documents to return upon a query.
            dataset_path (str [Path]): Path to the dataset directory.
        """
        self.__max_tokens = max_tokens
        self.__embedding = None
        if chroma_embedding:
            self.__embedding = ChromaEmbedding(
                use_openai=use_openai,
                num_matches=num_matches,
                dataset_path=dataset_path
            )
        else:
            self.__embedding = IndexEmbedding(
                use_openai=use_openai,
                chunking_max_tokens=chunking_max_tokens,
                num_matches=num_matches,
                dataset_path=dataset_path
            )

    def query(self, query) -> str:
        """
        Processes a query.

        Args:
            query (str): The query string.

        Returns:
            str: The text response from the Cohere API.
        """
        rag_docs = self.__embedding.get_similar_documents(query)
        rag_docs = [{i[1]: i[2]} for i in rag_docs]
        response = self.__co.chat(
            message=query,
            documents=rag_docs,
            conversation_id=self.__conversation_id,
            max_tokens=self.__max_tokens,
        )
        return response.text

    def end_chat(self) -> None:
        """
        Cleans up resources
        """
        self.__embedding.clear()


class OpenAI_LLM(Chat):
    """
    A class that integrates with OpenAI's language models for question answering purposes.

    Attributes:
        __open_api_key (str): API key for OpenAI.
        __open_llm (OpenAI): OpenAI language model initialized with the API key.
        __embedding Union(IndexEmbedding, ChromaEmbedding): an embedding system for the RAG to use
    """
    dotenv.load_dotenv()
    __open_api_key = os.getenv('OPENAI_API_KEY')
    __open_llm = OpenAI(
        temperature=0, openai_api_key=__open_api_key, verbose=True)
    __chain = Chain.get_chain(__open_llm)

    def __init__(self, chroma_embedding=True, use_openai=False, chunking_max_tokens=100, num_matches=5, dataset_path="RAG/datasets/") -> None:
        """
        Initializes the OpenAI class, setting up the embedding model used for queries.

        Args:
            chroma_embedding (bool): Flag to decide between using ChromaEmbedding or IndexEmbedding.
            use_openai (bool): Determines if OpenAI embeddings should be used.
            chunking_max_tokens (int): Maximum number of tokens for chunking in IndexEmbedding.
            num_matches (int): Number of matching documents to return upon a query.
            dataset_path (str): Path to the dataset directory.
        """
        self.__embedding = None
        if chroma_embedding:
            self.__embedding = ChromaEmbedding(
                use_openai=use_openai,
                num_matches=num_matches,
                dataset_path=dataset_path
            )
        else:
            self.__embedding = IndexEmbedding(
                use_openai=use_openai,
                chunking_max_tokens=chunking_max_tokens,
                num_matches=num_matches,
                dataset_path=dataset_path
            )

    def query(self, query) -> object:
        """
        Processes a query using OpenAI's language model.

        Args:
            query (str): The query string.

        Returns:
            str: The response from the language model.
        """
        rag_docs = self.__embedding.get_similar_documents(query)

        docs = [Document(page_content=doc[2], metadata={
                         "chunk": doc[1], "source": "local"}) for doc in rag_docs]
        chain = load_qa_chain(self.__open_llm, chain_type="stuff")
        out = chain.run(input_documents=docs, question=query)
        return out

    def end_chat(self) -> None:
        """
        Cleans up resources.
        """
        self.__embedding.clear()


if __name__ == "__main__":
    chat = None
    parser = argparse.ArgumentParser(description="X Ray Tooling LLM driver")

    # Option to choose between OpenAI and HuggingFace embeddings
    parser.add_argument('--use_openai_embeddings', action='store_true',
                        help="Use OpenAI embeddings instead of HuggingFace's")
    # Option to choose between vector index and chroma and HuggingFace embeddings
    parser.add_argument('--use_chroma', action='store_true',
                        help="Use Chroma db embeddings instead of a vector index")
    # Option to choose between cohere and openai llm
    parser.add_argument('--use_cohere', action='store_true',
                        help="Use cohere llm instead of openai")

    args = parser.parse_args()

    # Handle operations
    if args.use_cohere:
        chat = Cohere(args.use_chroma, args.use_openai_embeddings)
    else:
        chat = OpenAI_LLM(args.use_chroma, args.use_openai_embeddings)

    while True:
        # Get the user message
        message = input("User: ")

        # Typing "quit" or "q" ends the conversation
        if message.lower() == "quit" or message.lower() == "q":
            print("Ending chat.")
            break
        else:
            response = chat.query(message)
            print(response)
