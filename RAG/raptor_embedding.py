import os
import json
from dotenv import load_dotenv
import argparse
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import JSONLoader
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
import shutil
import sys
import importlib
from RAG.tree_builder import TreeBuilder
from tqdm import tqdm


def dynamic_import_embedding():
    # Construct the module name based on the script's execution directory
    # E.g., if you are in "path/to/module" and script is "dynamic_import.py",
    # it would translate to "path.to.module"
    current_path = os.path.dirname(os.path.abspath(__file__))
    # Add the directory containing the package to the system path.
    sys.path.append(os.path.dirname(current_path))

    # This might be the "package" if your file is in the root of the "package".
    module_directory = os.path.basename(current_path)
    try:
        # "module_directory" could be the result of any directory manipulation
        # logic you come up with based on __file__ or cwd.
        module = importlib.import_module(f"{module_directory}.embedding")
        Embedding = getattr(module, "Embedding")
        return Embedding
    except (ImportError, AttributeError):
        print("Could not dynamically import Embedding.")
        return None


# Now, you can use this function to dynamically import `Embedding`:
Embedding = dynamic_import_embedding()
if Embedding is not None:
    print("Embedding imported successfully!")
load_dotenv(override=True)


class Raptor(Embedding):
    def __init__(
        self,
        dataset_path="datasets/"
    ):

        self.__open_key = os.getenv('OPENAI_API_KEY')
        self.__embedding_open = OpenAIEmbeddings(
            openai_api_key=self.__open_key)
        self.__processed_articles_path = dataset_path + "xray_articles_processed.json"
        self.__articles_path = dataset_path + "xray_articles.json"
        self.__process_json()  # Ensure this method is called before loading articles
        self.__xray_articles = self.__load_xray_articles()
        self.__xray_chunked_articles = self.__chunk_documents(
            self.__xray_articles)
        self.__results = self.build_tree(level=1, n_levels=3)
        self.__vectorstore = self.collapse_tree(results=self.__results)

    def __process_json(self) -> object:
        # Load the original JSON
        with open(os.path.join(os.path.dirname(__file__), self.__articles_path), "r") as file:
            data = json.load(file)

        # Process each document
        for doc in tqdm(data, desc="Processing JSON documents"):
            doc['Authors'] = ' , '.join(doc['Authors'])
            doc['FullText'] = ' , '.join(doc['FullText'])

        # Save the processed JSON
        with open(os.path.join(os.path.dirname(__file__), self.__processed_articles_path), "w") as file:
            json.dump(data, file, indent=4)

    def __load_xray_articles(self) -> object:
        loader = JSONLoader(
            file_path=os.path.join(os.path.dirname(
                __file__), self.__processed_articles_path),
            jq_schema='.[].FullText',
            text_content=True)

        return loader.load()

    def __chunk_documents(self, documents, chunk_size=1000, chunk_overlap=200) -> object:
        d_sorted = sorted(documents, key=lambda x: x.metadata["source"])
        d_reversed = list(reversed(d_sorted))
        concatenated_content = "\n\n\n --- \n\n\n".join(
            [doc.page_content for doc in d_reversed]
        )
        text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
            chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        return text_splitter.split_text(concatenated_content)

    def build_tree(self, level=1, n_levels=3):
        tree_builder = TreeBuilder(
            texts=self.__xray_chunked_articles,
            embd=self.__embedding_open,
        )

        results = tree_builder.recursive_embed_cluster_summarize(
            level=level, n_levels=n_levels)
        return results

    def collapse_tree(self, results):
        all_texts = self.__xray_chunked_articles
        for level in tqdm(sorted(results.keys()), desc="Collapsing tree"):
            summaries = results[level][1]["summaries"].tolist()
            all_texts.extend(summaries)

        vectorstore = Chroma.from_texts(
            texts=all_texts, embedding=self.__embedding_open)
        return vectorstore

    def get_similar_documents(self, query_text):
        docs = self.__vectorstore.similarity_search(query_text)
        return docs

    def clear(self):
        self.__vectorstore.clear()


if __name__ == "__main__":
    baby_raptor = Raptor()
    question = "What bones can an x-ray identify?"
    answer = baby_raptor.query(question)
    print(f"Answer to question '{question}' is '{answer}'")
