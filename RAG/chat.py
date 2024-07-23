from cohere import Client
import os
from langchain_openai import ChatOpenAI
from langchain.callbacks import AsyncIteratorCallbackHandler
from langchain_core.output_parsers import StrOutputParser
from langchain_community.llms import Cohere
from langchain.chains.question_answering import load_qa_chain
from langchain_core.runnables import RunnableLambda
from langchain_core.prompts import ChatPromptTemplate
from langchain.docstore.document import Document
import uuid
import argparse
import dotenv
from RAG.chroma_embedding import ChromaEmbedding
from RAG.index_embedding import IndexEmbedding
from abc import ABC, abstractmethod
from RAG.flows import FlowType, Flow
import langchain
from operator import itemgetter
import asyncio
from langchain.chains.prompt_selector import ConditionalPromptSelector, is_chat_model
from langchain.prompts import PromptTemplate
from langchain.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)



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

    def __init__(self, llm: str = "openai", chroma_embedding=True, use_openai=True, chunking_max_tokens=100, num_matches=5, max_tokens=500, dataset_path="../RAG/datasets/"):
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
                temperature=0, openai_api_key=self.__key, verbose=True, model="gpt-4-0125-preview", streaming=True)
        elif llm == "cohere":
            self.__client = Cohere()

        self.__conversation_id = str(uuid.uuid4())
        self.__chain = Chain.get_chain(self.__client)

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
    
    
    
    async def stream_query(self, query, injury: str, injury_location: str):
        """
        Stream a query using OpenAI's language model.

        Args:
            query (str): The query string.

        Returns:
            AsyncGenerator: Each token yielded for streamingResponse
        """

        rag_docs = self.__embedding.get_similar_documents(query)

        docs = [Document(page_content=doc[2], metadata={
                         "chunk": doc[1], "source": "local"}) for doc in rag_docs]
        
        callback = AsyncIteratorCallbackHandler()
        self.__client = ChatOpenAI(
                temperature=0, openai_api_key=self.__key, verbose=True, model="gpt-4-0125-preview", streaming=True, callbacks=[callback])
        

        prompt_template = """Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

        {context}

        Question: {question}
        Helpful Answer:"""
        PROMPT = PromptTemplate(
            template=prompt_template, input_variables=["context", "question", "injury", "injury_location"]
        )

        system_template = """You are a medical expert. Given an injury, injury location, and medical documents on injuries, 
        you will provide. \n\n Do not state 'Based on the medical documents provided' or anything of the sort. 
        Do not state the phrase 'After reviewing your medical documents...', 
        you must instead provide your answer the way an automated doctor would provide an 
        answer to the patient. Do not provide an introductory sentence, just jump straight to the 
        diagnosis and required information. No need for overall either. Make sure your answer is concise, 
        clear, and informative.
        ----------------
        injury: {injury}
        injury location: {injury_location}
        documents: {context}"""
        messages = [
            SystemMessagePromptTemplate.from_template(system_template),
            HumanMessagePromptTemplate.from_template("{question}"),
        ]
        CHAT_PROMPT = ChatPromptTemplate.from_messages(messages)


        PROMPT_SELECTOR = ConditionalPromptSelector(
            default_prompt=PROMPT, conditionals=[(is_chat_model, CHAT_PROMPT)]
        )

        chain = load_qa_chain(self.__client, chain_type="stuff", verbose=True, prompt=PROMPT_SELECTOR.get_prompt(self.__client))


        async def wrap_done(fn, event):
            try:
                await fn
            except Exception as e:
                print(f"Caught exception: {e}")
            finally:
                event.set()

        task = asyncio.create_task(
            wrap_done(
                chain.ainvoke(input={"input_documents":docs, "question":query, "injury": injury, "injury_location": injury_location}),
                callback.done
            )
        )

        buffer = ""
        async for token in callback.aiter():
            buffer += token
            if " " in buffer:
                word, buffer = buffer.rsplit(" ", 1)
                yield f"data: {word}\n\n"

        if buffer:
            yield f"data: {buffer}\n\n"

        await task      

        # Yield the docs content
        for doc in docs:
            yield f"data: doc-content: {doc.page_content}\n\n"


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

        ##print(f"Templated Query: {flow_query}")

        out = self.__chain.invoke({"template": flow_query, "documents": docs})
        return [out, docs]

    async def stream_flow_query(self, injury: str, injury_location: str, flow: FlowType) -> object:
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
        callback = AsyncIteratorCallbackHandler()
        self.__client = ChatOpenAI(
                temperature=0, openai_api_key=self.__key, verbose=True, model="gpt-4-0125-preview", streaming=True, callbacks=[callback])
        
        self.__chain = Chain.get_chain(self.__client)

        async def wrap_done(fn, event):
            try:
                await fn
            except Exception as e:
                print(f"Caught exception: {e}")
            finally:
                event.set()

        task = asyncio.create_task(
            wrap_done(
                self.__chain.ainvoke(input={"template": flow_query, "documents": docs}),
                callback.done
            )
        )

        buffer = ""
        async for token in callback.aiter():
            buffer += token
            if " " in buffer:
                word, buffer = buffer.rsplit(" ", 1)
                yield f"data: {word}\n\n"

        if buffer:
            yield f"data: {buffer}\n\n"

        await task  

        # Yield the docs content
        for doc in docs:
            yield f"data: doc-content:{doc.page_content}\n\n"

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
    parser.add_argument('--use_chroma', action='store_true',
                        help="Use Chroma db embeddings instead of a vector index")
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

    ##print("Testing each Flow...")
    response = chat.flow_query(injury, injury_location, FlowType.BASE)

    ##print(f"\nResponse: {response}")
    while True:
        # Get the user message
        message = input("User: ")

        # Typing "quit" or "q" ends the conversation
        if message.lower() == "quit" or message.lower() == "q":
            ##print("Ending chat.")
            break
        else:
            response = chat.stream_query(message)
            print(response)
            print(type(response))
