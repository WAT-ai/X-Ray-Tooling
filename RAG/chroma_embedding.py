import os
import json
from dotenv import load_dotenv
import argparse
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import JSONLoader
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
import shutil
import os
import sys
import importlib
# from embedding import Embedding


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


class ChromaEmbedding(Embedding):
    """
    A class for handling embedding operations and Chroma database interactions.

    This class provides methods to set up embedding models, process x-ray articles,
    create, populate, and manage a Chroma vector database.

    Attributes:
        __open_key (str): The API key for OpenAI.
        __embeddings_hugging (HuggingFaceEmbeddings): HuggingFace embedding model.
        __embedding_open (OpenAIEmbeddings): OpenAI embedding model.
        __persist_chroma_directory (str): Directory for persisting Chroma database.
        __xray_articles (list): Loaded x-ray articles.
        __xray_chunked_articles (list): Chunked x-ray articles.
        __embedding_in_use (object): The embedding model currently in use.
        __chroma_db (Chroma): Chroma vector database instance.
        __num_matches (int): the number of document chunks to return upon a query
        __processed_articles_path (str [Path]): the path to the processed (chunked) articles
        __articles_path (str [Path]): the path to the raw xray articles
    """

    def __init__(
        self,
        use_openai=False,
        num_matches=5,
        dataset_path="RAG/datasets/"
    ) -> None:

        self.__open_key = os.getenv('OPENAI_API_KEY')
        self.__embeddings_hugging = HuggingFaceEmbeddings(
            model_name="all-MiniLM-L6-v2")
        self.__embedding_open = OpenAIEmbeddings(
            openai_api_key=self.__open_key)
        self.__persist_chroma_directory = 'db'
        self.__num_matches = num_matches
        self.__processed_articles_path = dataset_path + "xray_articles_processed.json"
        self.__articles_path = dataset_path + "xray_articles.json"

        # Now, since paths are set, you can proceed with loading and processing
        self.__process_json()  # Ensure this method is called before loading articles
        self.__xray_articles = self.__load_xray_articles()
        self.__xray_chunked_articles = self.__chunk_documents(
            self.__xray_articles)
        self.__embedding_in_use = self.__embedding_open if use_openai else self.__embeddings_hugging
        print(f"Using {'OpenAI' if use_openai else 'HuggingFace'} Embedding")
        self.__chroma_db = None
        if not os.path.isdir('./db'):
            self.create_and_populate_chroma()

        self.load_chroma_db()

    def __load_and_chunk_articles(self) -> object:
        docs = self.__load_xray_articles()
        self.__xray_chunked_articles = self.__chunk_documents(docs)

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

    def create_and_populate_chroma(self) -> None:
        """
        Creates a Chroma database from chunked x-ray articles and populates it with embeddings.
        """

        if os.path.isdir("./db"):
            print("Chroma DB already exists. Skipping creation.")
        else:
            print("Creating Chroma DB...")
            vector_db = Chroma.from_documents(self.__xray_chunked_articles,  # TODO: REMOVE THE :5
                                              self.__embedding_in_use,
                                              persist_directory=self.__persist_chroma_directory)

            self.__chroma_db = vector_db.persist()
            print("Chroma DB created and populated.")
            return

    def load_chroma_db(self) -> None:
        """
        Loads the Chroma database from the persistent storage.
        """
        if self.__chroma_db:
            print("Chroma DB already loaded.")
        else:
            vector_db = Chroma(
                persist_directory=self.__persist_chroma_directory,
                # Corrected to use the private attribute
                embedding_function=self.__embedding_in_use,
            )

            self.__chroma_db = vector_db

    def get_similar_documents(self, query) -> list[tuple[float, int, str]]:
        """
        Retrieves documents from the Chroma database based on a given query.

        Args:
            query (str): The query string for document retrieval.
            search_kwargs (int, optional): Additional search parameters. Defaults to 2.

        Returns:
            object: Retrieved documents from the Chroma database.
        """
        # TODO restrict return doc amount to self.__num_matches
        docs = self.__chroma_db.similarity_search(query)
        parsed_docs = []
        for doc in docs:
            parsed_docs.append(
                (0.0, doc.metadata['seq_num'], doc.page_content))
        return parsed_docs

    def reupload_to_chroma(self) -> None:
        """
        Clears the current Chroma database and re-uploads chunked articles.
        """
        self.clear()
        self.__load_and_chunk_articles()
        self.__chroma_db = Chroma.from_documents(
            self.__xray_chunked_articles)

    def check_db_populated(self):
        try:
            # Attempt to fetch a small number of documents as a test
            sample_query = "xray"  # This can be any string if you're just checking for presence
            results = self.__chroma_db.similarity_search(sample_query)
            if results:
                print("Chroma DB is populated.")
                return True
            else:
                print("Chroma DB is empty.")
                return False
        except Exception as e:
            print(f"Error checking Chroma DB: {e}")
            return False

    def clear(self) -> None:
        """
        Clears documents from the Chroma database.
        """
        ids_to_delete = []

        for doc in self.__chroma_db:
            if doc.metadata.get('source') == self.__xray_chunked_articles:
                ids_to_delete.append(doc.id)

        self.__chroma_db.delete(ids=ids_to_delete)

    def get_articles(self) -> object:
        return self.__xray_articles

    def get_chunked_articles(self) -> object:
        return self.__xray_chunked_articles

    def get_hugging_embedding_model(self) -> object:
        return self.__embeddings_hugging

    def get_open_embedding_model(self) -> object:
        return self.__embedding_open

    def get_current_embedding_model(self) -> object:
        return self.__embedding_in_use

    def get_chroma_db(self) -> object:
        return self.__chroma_db

    def destroy(self):
        folder_path = 'db'  # Path to the Chroma DB folder
        try:
            shutil.rmtree(folder_path)
            print("Chroma DB folder deleted successfully.")
        except FileNotFoundError:
            print("The folder does not exist.")
        except Exception as e:
            print(f"An error occurred: {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Chroma Embedding Tool")

    # Option to choose between OpenAI and HuggingFace embeddings
    parser.add_argument('--use_openai', action='store_true',
                        help="Use OpenAI embeddings instead of HuggingFace's")

    # Commands for different operations
    subparsers = parser.add_subparsers(dest='operation', help='Operations')

    # Add subparsers for each operation
    subparsers.add_parser('build', help='Create and populate Chroma DB')
    subparsers.add_parser('load', help='Load Chroma DB')
    subparsers.add_parser('retrieve', help='Retrieve documents based on query').add_argument(
        'query', type=str, help='Query for document retrieval')
    subparsers.add_parser('reupload', help='Reupload documents to Chroma')
    subparsers.add_parser('clear', help='Clear Chroma DB')
    subparsers.add_parser('destroy', help='Destroy Chroma DB')

    args = parser.parse_args()

    # Initialize ChromaEmbedding with or without OpenAI embeddings based on the command line argument
    chroma = ChromaEmbedding(use_openai=args.use_openai)

    # Handle operations
    if args.operation == 'retrieve':
        print(chroma.get_similar_documents(args.query))
    elif args.operation == 'reupload':
        chroma.reupload_to_chroma()
    elif args.operation == 'clear':
        chroma.clear()
    elif args.operation == 'destroy':
        chroma.destroy()
    else:
        parser.print_help()
