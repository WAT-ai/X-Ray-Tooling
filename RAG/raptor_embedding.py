"""
Functions:
1. Chunking and preprocessing documents
2. Creating and populating tree
3. Collapsing the tree
4. Querying the tree
"""

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
from langchain_core.runnables import RunnablePassthrough

class Raptor:
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
        with open(os.path.join(os.path.dirname(__file__),self.__articles_path), "r") as file:
            data = json.load(file)

        # Process each document
        for doc in data:
            doc['Authors'] = ' , '.join(doc['Authors'])
            doc['FullText'] = ' , '.join(doc['FullText'])

        # Save the processed JSON
        with open(os.path.join(os.path.dirname(__file__),self.__processed_articles_path), "w") as file:
            json.dump(data, file, indent=4)
            
    def __load_xray_articles(self) -> object:
        loader = JSONLoader(
            file_path=os.path.join(os.path.dirname(__file__),self.__processed_articles_path),
            jq_schema='.[].FullText',
            text_content=True)

        return loader.load()

    def __chunk_documents(self, documents, chunk_size=1000, chunk_overlap=200) -> object:
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        return text_splitter.split_documents(documents)

    def build_tree(self, level=1, n_levels=3):
        tree_builder = TreeBuilder(
            texts=self.__xray_chunked_articles,
            embd=self.__embedding_open,
        )

        results = tree_builder.recursive_embed_cluster_summarize(level=level, n_levels=n_levels)
        return results

    def collapse_tree(self, results):
        all_texts = self.__xray_chunked_articles
        for level in sorted(results.keys()):
            summaries = results[level][1]["summaries"].tolist()
            all_texts.extend(summaries)
        
        vectorstore = Chroma.from_documents(texts=all_texts, embedding=self.__embedding_open)
        return vectorstore
    
    def query(self, query_text):
        response = self.__vectorstore.similarity_search(query_text)
        return response

if __name__ == "__main__":
    baby_raptor = Raptor()
    question = "What bones can an x-ray identify?"
    answer = baby_raptor.query(question)
    print(f"Answer to question '{question}' is '{answer}'")
