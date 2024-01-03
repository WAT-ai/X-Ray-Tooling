import json
from cohere import Client
import os
import pandas as pd
import dotenv
import csv
import argparse
import langchain
from langchain.embeddings import HuggingFaceEmbeddings
import time
import numpy as np
import pickle
from scipy import spatial
from langchain.chat_models import ChatOpenAI
from langchain.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain.schema import HumanMessage, SystemMessage
from langchain.llms import OpenAI
from langchain.chains.question_answering import load_qa_chain
from langchain.document_loaders import JSONLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter, CharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings


class PubmedEmbedding:
    def __init__(self):
        dotenv.load_dotenv()
        self.co = Client(os.getenv('COHERE_API_KEY'))
        self.xray_articles = self.load_xray_articles()
        self.embedding_model = HuggingFaceEmbeddings(
            model_name="all-MiniLM-L6-v2")
        self.open = os.getenv('OPENAI_API_KEY')
        self.embedding_open = OpenAIEmbeddings(openai_api_key=self.open)

    def load_xray_articles(self):
        with open("RAG/datasets/xray_articles.json", "r", encoding='utf-8') as f:
            return json.load(f)

    def load_chunked_xray_articles_json(self):
        with open("RAG/datasets/xray_articles_chunked.json", "r", encoding='utf-8') as f:
            return json.load(f)

    def load_chunked_xray_articles_csv(self):
        return pd.read_csv("RAG/datasets/xray_articles_chunked.csv")

    def convert_json_to_df(self, json_data=None):
        if json_data is None:
            df = pd.DataFrame(self.xray_articles)
        else:
            df = pd.DataFrame(json_data)
        return df

    def print_metadata(self):
        df = self.convert_json_to_df()
        print("Length of unprocessed dataset: ", len(df))
        print("Columns: ", df.columns)
        print("Sample row: ", df.iloc[0])
        # changed to loading the csv (before was calling load_chunked_xray_articles() that didnt exist)
        df2 = pd.DataFrame(self.load_chunked_xray_articles_csv())
        print("Length of chunked dataset: ", len(df2))
        print("Columns: ", df2.columns)
        print("Sample row: ", df2.iloc[0])

    def chunk_text(self, tokens, num_tokens=100):

        return [tokens[i:i+num_tokens] for i in range(0, len(tokens), num_tokens)]

    # Pardon my ghetto tokenization LOL
    def create_chunked_dataset(self, max_tokens=100):
        df = self.convert_json_to_df()
        chunked_dataset = []
        for i, row in df.iterrows():
            j = 0
            # fulltext is an array of strings
            full_text = " ".join(row['FullText']).split(" ")
            # tokenize

            for chunk in self.chunk_text(full_text, max_tokens):
                chunk_text = " ".join(chunk)
                chunked_dataset.append({
                    "title": row['Title'],
                    "authors": row['Authors'],
                    "publication_date": row['PublicationDate'],
                    "PMID": row['PMID'],
                    "text": chunk_text,
                    "chunk_num": j
                })
                j += 1
        # save as json
        with open("RAG/datasets/xray_articles_chunked.json", "w") as f:
            json.dump(chunked_dataset, f)

    def convert_json_to_csv(self, json_data=None):
        df = self.convert_json_to_df(json_data)
        df.to_csv("RAG/datasets/xray_articles.csv")

    def run_batch_embeddings_ingestion(self, use_huggingface=False, use_openai=False):
        df = self.load_chunked_xray_articles_csv()
        print(df.head())
        new_df = df.head(5).copy()
        chunks = new_df['text'].tolist()
        # one call per document
        pub_ids = new_df['PMID'].tolist()

        # create a dictionary of pub_id -> list[chunk]
        pub_id_to_chunks = {}
        for i, pub_id in enumerate(pub_ids):
            if pub_id not in pub_id_to_chunks:
                pub_id_to_chunks[pub_id] = []
            pub_id_to_chunks[pub_id].append(chunks[i])

        # do one call per pub_id'
        embeddings_as_lists = []
        for pub_id in pub_id_to_chunks:
            # embedding_result = self.co.embed(pub_id_to_chunks[pub_id], model="embed-english-v3.0", input_type="search_query")
            # Hugging Face Embeddings
            # embedding_result = self.embedding_model.embed_documents(
            #     pub_id_to_chunks[pub_id])

            # OpenAI Embeddings
            # embedding_result = self.embedding_open.aembed_documents(
            #     pub_id_to_chunks[pub_id])

            embedding_result = None
            if use_huggingface:
                # Logic for HuggingFace embeddings
                embedding_result = self.embedding_model.embed_documents(
                    pub_id_to_chunks[pub_id])
            elif use_openai:
                # Logic for OpenAI embeddings
                embedding_result = self.embedding_open.aembed_documents(
                    pub_id_to_chunks[pub_id])
            else:
                raise ValueError("No embedding model selected")
            embeddings_as_lists.extend([list(embedding)
                                       for embedding in embedding_result])
            print("Finished embedding pub_id: ", pub_id)

        new_df['embedding'] = embeddings_as_lists
        new_df.to_csv(
            "RAG/datasets/xray_articles_with_embeddings2.csv", index=True)

    def build_vector_index(self):
        df = pd.read_csv("RAG/datasets/xray_articles_with_embeddings2.csv")
        index = [(row['index'], row['embedding'], row['text'])
                 for _, row in df.iterrows()]
        # make embeddings into list of floats
        index = [(row[0], [float(x) for x in row[1][1:-1].split(",")], row[2])
                 for row in index]
        # save as a pickle
        with open("RAG/datasets/xray_articles_vector_index.pkl", "wb") as f:
            pickle.dump(index, f)

    def retrieve_vector_index(self):
        list_of_embeddings = []
        start = time.time()
        with open("RAG/datasets/xray_articles_vector_index.pkl", "rb") as f:
            list_of_embeddings = pickle.load(f)
        print("latency: ", time.time() - start)

        return list_of_embeddings

    def cosine_similarity(self, v1, v2):
        return 1 - spatial.distance.cosine(v1, v2)

    def run_similarity_search(self, query, k=5):
        embeddings = self.retrieve_vector_index()
        query_embedding = self.embedding_model.embed_query(query)
        similarity_scores = []
        for (i, embedding, chunk) in embeddings:
            similarity_scores.append(
                (self.cosine_similarity(query_embedding, embedding), i, chunk))

        sorted_similarity_scores = sorted(
            similarity_scores, key=lambda x: x[0], reverse=True)
        print("Top ", k, " results: ")
        for score, i, chunk in sorted_similarity_scores[:k]:
            print("Score: ", score)
            print("Chunk: ", chunk)
        return sorted_similarity_scores[:k]

    def results_to_json(self, results, filename="RAG/datasets/results.json"):
        store = {}
        for result_tuple in results:
            print(f"Current: {result_tuple}")
            score, i, chunk = result_tuple  # Unpack the tuple directly
            store[f"chunk{i}"] = chunk

        # Write the store dictionary to a JSON file
        with open(filename, 'w') as json_file:
            json.dump(store, json_file, indent=4)

    def load_file(self, input_file="RAG/datasets/results.json") -> object:
        loader = JSONLoader(
            file_path=input_file,
            jq_schema='.[]',
            text_content=True)
        return loader.load()

    def nlp_openai(self, docs, query) -> str:
        llm = OpenAI(
            temperature=0, openai_api_key=self.open)
        chain = load_qa_chain(llm, chain_type="stuff")
        out = chain.run(input_documents=docs, question=query)
        return out

    def nlp_cohere(self, docs, query, max_tokens=500) -> str:
        response = self.co.chat(
            message=query,
            documents=docs,
            # conversation_id=self.conversation_id,         ADD BACK WHEN WE WANT TO HAVE ONGOING CONVERSATIONS
            max_tokens=max_tokens,
        )
        return response.text


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pubmed Embedding Tool")
    subparsers = parser.add_subparsers(
        dest='command', help='Available commands')

    # Subparser for run_batch
    parser_run_batch = subparsers.add_parser(
        'run_batch',
        help='Run batch embeddings ingestion with a specified embedding model (see "run_batch -h" for more options)')
    parser_run_batch.add_argument(
        '-hf', '--huggingface', action='store_true',
        help='Use HuggingFace embeddings for batch ingestion')
    parser_run_batch.add_argument(
        '-oi', '--openai', action='store_true',
        help='Use OpenAI embeddings for batch ingestion')

    parser.add_argument("-b", "--build_index",
                        action="store_true", help="Build vector index")
    parser.add_argument("-e", "--retrieve_index",
                        action="store_true", help="Retrieve embeddings")
    parser.add_argument("-p", "--print_metadata",
                        action="store_true", help="Print metadata")
    parser.add_argument("-c", "--create_chunked_dataset",
                        action="store_true", help="Create chunked dataset")
    parser.add_argument("-s", "--openai_response",
                        action="store_true", help="Run similarity search, response text from openai")
    parser.add_argument("-co", "--cohere_response",
                        action="store_true", help="Run similarity search, but response text will be from cohere")
    args = parser.parse_args()

    pe = PubmedEmbedding()
    if args.command == 'run_batch':
        pe.run_batch_embeddings_ingestion(
            use_huggingface=args.huggingface, use_openai=args.openai)
    if args.build_index:
        pe.build_vector_index()
    if args.retrieve_index:
        embeddings = pe.retrieve_vector_index()
        # print(embeddings)
    if args.print_metadata:
        pe.print_metadata()
    if args.create_chunked_dataset:
        pe.create_chunked_dataset()
    if args.openai_response:
        query = "chest issues"
        result = pe.run_similarity_search(query)
        pe.results_to_json(result)
        docs = pe.load_file()
        out = pe.nlp_openai(docs, query)
        print(f"NLP: {out}")
    if args.cohere_response:
        query = "Alzheimers disease"
        """
        since I'm running on windows the jq loader doesn't function and I can't use the JSONloader from langchain,
        so I just load the json normally into the form [{"snippet": text1}, {"snippet": text2}, ...]
        """
        with open("RAG/datasets/results.json", "r") as json_file:
            docs = json.load(json_file)
        docs = [{"snippet": value} for value in docs.values()]
        # result = pe.run_similarity_search(query)
        # pe.results_to_json(result)
        # docs = pe.load_file()
        out = pe.nlp_cohere(docs, query)
        print(f"NLP: {out}")

    # If no arguments are provided, display the help message
    if not any(vars(args).values()):
        parser.print_help()
