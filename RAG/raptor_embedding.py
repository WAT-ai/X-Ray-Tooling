import os
import json
from dotenv import load_dotenv
import argparse
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import JSONLoader
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_openai import OpenAI
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
        dataset_path="datasets/",
        embedding_model="text-embedding-3-small",
        llm_model="gpt-3.5-turbo-0125"
    ):

        self.__open_key = os.getenv('OPENAI_API_KEY')
        self.__embedding_open = OpenAIEmbeddings(
            openai_api_key=self.__open_key, model=embedding_model)
        self.llm = OpenAI(openai_api_key=self.__open_key,
                          model=llm_model)
        self.__persist_chroma_directory = 'collapsed_tree_db'
        self.__processed_articles_path = dataset_path + "xray_articles_processed.json"
        self.__articles_path = dataset_path + "xray_articles.json"
        self.__process_json()  # Ensure this method is called before loading articles
        self.__xray_articles = self.__load_xray_articles()
        self.__xray_chunked_articles = self.__chunk_documents(
            self.__xray_articles)
        self.__results = self.__build_tree(level=1, n_levels=3)
        self.__tree_db = None
        if not os.path.isdir('./collapsed_tree_db'):
            self.__collapse_tree(results=self.__results)

        self.load_tree_db()

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

    def __chunk_documents(self, documents, chunk_size=1000, chunk_overlap=100) -> object:
        d_sorted = sorted(documents, key=lambda x: x.metadata["source"])
        d_reversed = list(reversed(d_sorted))
        concatenated_content = "\n\n\n --- \n\n\n".join(
            [doc.page_content for doc in d_reversed]
        )
        text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
            chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        return text_splitter.split_text(concatenated_content)

    def __build_tree(self, level=1, n_levels=3):
        print("Building tree...")
        tree_builder = TreeBuilder(
            texts=self.__xray_chunked_articles,
            embd=self.__embedding_open,
            model=self.llm,
        )

        print("Embedding and clustering...")
        results = tree_builder.recursive_embed_cluster_summarize(
            level=level, n_levels=n_levels)

        return results

    def __collapse_tree(self, results):
        all_texts = self.__xray_chunked_articles
        for level in tqdm(sorted(results.keys()), desc="Collapsing tree"):
            summaries = results[level][1]["summaries"].tolist()
            all_texts.extend(summaries)

        vectorstore = Chroma.from_texts(
            texts=all_texts, embedding=self.__embedding_open, persist_directory=self.__persist_chroma_directory)
        self.__tree_db = vectorstore
        return

    def load_tree_db(self):
        if self.__tree_db:
            print("Chroma DB already loaded.")
        else:
            vector_db = Chroma(
                persist_directory=self.__persist_chroma_directory,
                embedding_function=self.__embedding_open,
            )

            self.__tree_db = vector_db

    def get_similar_documents(self, query_text):
        docs = self.__tree_db.similarity_search(query_text)
        return docs

    def clear(self):
        ids_to_delete = []

        for doc in self.__chroma_db:
            if doc.metadata.get('source') == self.__xray_chunked_articles:
                ids_to_delete.append(doc.id)

        self.__tree_db.delete(ids=ids_to_delete)


# if __name__ == "__main__":
#     baby_raptor = Raptor()
#     question = "What bones can an x-ray identify?"
#     answer = baby_raptor.get_similar_documents(question)
#     print(f"Answer to question '{question}' is '{answer}'")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Raptor Embedding Tool")

    # Option to choose between OpenAI and HuggingFace embeddings
    parser.add_argument('--embedding_model', type=str,
                        default="text-embedding-3-small", help="OpenAI embedding model")
    parser.add_argument('--llm_model', type=str,
                        default="gpt-3.5-turbo-0125", help="OpenAI language model")

    # Commands for different operations
    subparsers = parser.add_subparsers(dest='operation', help='Operations')

    # Add subparsers for each operation
    subparsers.add_parser(
        'build', help='Create and populate the tree and collapse it into Chroma DB')
    subparsers.add_parser(
        'load', help='Load the collapsed tree from Chroma DB')
    subparsers.add_parser('retrieve', help='Retrieve documents based on query').add_argument(
        'query', type=str, help='Query for document retrieval')
    subparsers.add_parser('clear', help='Clear Chroma DB')

    args = parser.parse_args()

    # Initialize Raptor with or without OpenAI embeddings based on the command line argument
    raptor = Raptor(embedding_model=args.embedding_model,
                    llm_model=args.llm_model)

    # Handle operations
    if args.operation == 'build':
        raptor.__build_tree()
    elif args.operation == 'load':
        raptor.load_tree_db()
    elif args.operation == 'retrieve':
        print(raptor.get_similar_documents(args.query))
    elif args.operation == 'clear':
        raptor.clear()
    else:
        parser.print_help()
