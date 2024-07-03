from cohere import Client
import os
from langchain_openai import ChatOpenAI
from langchain_community.llms import Cohere
from langchain.chains.question_answering import load_qa_chain
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_core.prompts import ChatPromptTemplate
from langchain.docstore.document import Document
import uuid
import argparse
import dotenv
from RAG.chroma_embedding import ChromaEmbedding
from RAG.index_embedding import IndexEmbedding
from RAG.raptor_embedding import RaptorEmbedding
from abc import ABC, abstractmethod
from RAG.flows import FlowType, Flow
import langchain
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


class Chat():
    """
    A class that integrates with the Cohere API for conversational AI purposes.

    Attributes:
        __cohere_key (str): API key for Cohere.
        __co (Client): Cohere client initialized with the API key.
        __conversation_id (str): Unique ID for tracking the conversation.
        __embedding Union(IndexEmbedding, ChromaEmbedding): an embedding system for the RAG to use
        __max_tokens int: max number of tokns a response to a query can be
    """

    def __init__(self, llm: str = "openai", embedding_type="raptor", use_openai=True, chunking_max_tokens=100, num_matches=5, max_tokens=500, dataset_path="../RAG/datasets/"):
        """
        Initializes the Chat class, setting up the embedding model used for queries.

        Args:
            chroma_embedding (bool): Flag to decide between using ChromaEmbedding or IndexEmbedding.
            use_openai (bool): Determines if OpenAI embeddings should be used vs huggingface.
            chunking_max_tokens (int): Maximum number of tokens for chunking in IndexEmbedding.
            num_matches (int): Number of matching documents to return upon a query.
            dataset_path (str [Path]): Path to the dataset directory.
        """

        dotenv.load_dotenv()
        self.__key = os.getenv(f'{llm.upper()}_API_KEY')

        if llm == "openai":
            self.__client = ChatOpenAI(
                temperature=0, openai_api_key=self.__key, verbose=True, model="gpt-4-0125-preview")
        elif llm == "cohere":
            self.__client = Cohere()

        self.__conversation_id = str(uuid.uuid4())
        self.__chain = Chain.get_chain(self.__client)

        self.__max_tokens = max_tokens
        self.__embedding = None
        if embedding_type == "chroma":
            self.__embedding = ChromaEmbedding(
                use_openai=use_openai,
                num_matches=num_matches,
                dataset_path=dataset_path
            )
        elif embedding_type == "index":
            self.__embedding = IndexEmbedding(
                use_openai=use_openai,
                chunking_max_tokens=chunking_max_tokens,
                num_matches=num_matches,
                dataset_path=dataset_path
            )
        else:
            self.__embedding = RaptorEmbedding(dataset_path=dataset_path)

    def query(self, query) -> str:
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
        chain = load_qa_chain(self.__client, chain_type="stuff")
        out = chain.run(input_documents=docs, question=query)
        return [out, docs]

    def stream_query(self, query):
        """
        Stream a query using OpenAI's language model.

        Args:
            query (str): The query string.

        Returns:
            str: The response from the language model.
        """
        rag_docs = self.__embedding.get_similar_documents(query)

        docs = [Document(page_content=doc[2], metadata={
                         "chunk": doc[1], "source": "local"}) for doc in rag_docs]
        chain = load_qa_chain(self.__client, chain_type="stuff")
        response = chain.stream(
            {"input_documents": docs, "question": query}, return_only_outputs=True)

        for chunk in response:
            current_content = chunk
            yield current_content["output_text"]

    def flow_query(self, injury: str, injury_location: str, flow: FlowType) -> object:
        """
        Processes a query using OpenAI's language model.

        Args:
            query (str): The query string.

        Returns:
            str: The response from the language model.
        """
        flow_query = Flow.template(injury, injury_location, flow)

        rag_docs = self.__embedding.get_similar_documents(flow_query)
        docs = [Document(page_content=doc[2], metadata={
                         "chunk": doc[1], "source": "local"}) for doc in rag_docs]

        print(f"Templated Query: {flow_query}")

        out = self.__chain.invoke({"template": flow_query, "documents": docs})
        return [out, docs]

    def stream_flow_query(self, injury: str, injury_location: str, flow: FlowType) -> object:
        """
        Processes a query using OpenAI's language model.

        Args:
            query (str): The query string.

        Returns:
            str: The response from the language model.
        """
        flow_query = Flow.template(injury, injury_location, flow)

        rag_docs = self.__embedding.get_similar_documents(flow_query)
        docs = [Document(page_content=doc[2], metadata={
                         "chunk": doc[1], "source": "local"}) for doc in rag_docs]

        print(f"Templated Query: {flow_query}")

        out = self.__chain.stream({"template": flow_query, "documents": docs})

        for chunk in out:
            current_content = chunk
            yield current_content.content

    def end_chat(self) -> None:
        """
        Cleans up resources
        """
        self.__embedding.destroy()


if __name__ == "__main__":
    chat = None
    parser = argparse.ArgumentParser(description="X Ray Tooling LLM driver")

    # Option to choose between OpenAI and HuggingFace embeddings
    parser.add_argument('--use_openai_embeddings', action='store_true',
                        help="Use OpenAI embeddings instead of HuggingFace's")
    # Option to choose between vector index and chroma and HuggingFace embeddings
    parser.add_argument('--use_embedding_method', action=str,
                        default="raptor", help="Pick which embedding method to use out of [raptor, index, chroma]")
    # Option to choose between cohere and openai llm
    parser.add_argument('--use_cohere', action='store_true',
                        help="Use cohere llm instead of openai")

    args = parser.parse_args()

    # Handle operations

    if args.use_cohere:
        chat = Chat("cohere", args.use_chroma, args.use_openai_embeddings)
    else:
        chat = Chat("openai", args.use_chroma, args.use_openai_embeddings)

    injury = "Fracture"
    injury_location = "Ankle, Tibia Bone"

    print("Testing each Flow...")
    response = chat.flow_query(injury, injury_location, FlowType.BASE)

    print(f"\nResponse: {response}")
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
            print(type(response))
