import json
import os
import errno
import pandas as pd
import time
import pickle
import dotenv
from scipy import spatial
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.embeddings import OpenAIEmbeddings
from langchain.text_splitter import CharacterTextSplitter, NLTKTextSplitter, SpacyTextSplitter
from RAG.embedding import Embedding


class IndexEmbedding(Embedding):
    """
    A class for handling embedding operations for a vector index of articles.

    This class provides methods to set up embedding models, process x-ray articles,
    create, populate, and manage an index vector database.

    Attributes:
        __open_key (str): The API key for OpenAI.
        __embeddings_hugging (HuggingFaceEmbeddings): HuggingFace embedding model.
        __embedding_open (OpenAIEmbeddings): OpenAI embedding model.
        __articles_path (str [Path]): the path to the raw xray articles
        __embedding_path (str [Path]): the path to the embedded xray articles (or the path to the file where they will be stored)
        __index_path (str [Path]): the path to the vector index (or the path to the file where it will be stored)
        __chunked_articles_csv_path (str [Path]): the path to the chunked articles csv (or the path to the file where it will be stored)
        __chunked_articles_json_path (str [Path]): the path to the chunked articles json (or the path to the file where it will be stored)
        __chunking_max_tokens (int): the number of words to be considered a chunk
        __num_matches (int): the number of document chunks to return upon a query
        __use_openai (bool): whether or not to use openai embeddings vs huggingface embeddings
        __xray_chunked_articles (DataFrame): the chunked articles loaded
    """
    dotenv.load_dotenv()
    __open_key = os.getenv('OPENAI_API_KEY')
    __embeddings_hugging = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2")
    __embedding_open = OpenAIEmbeddings(openai_api_key=__open_key)

    def __init__(
            self,
            use_openai=False,
            num_matches=5,
            dataset_path="../RAG/datasets/",
            chunking_max_tokens=100
    ) -> None:
        """
        Args:
            use_openai (bool): If True, sets OpenAI embeddings.
            chunking_max_tokens (int): the number of words to be considered a chunk
            num_matches (int): number of matching chunks to be returned upon a query
            dataset_path (str [Path]): path to the folder where all datasets will be stored
        """
        self.__articles_path = dataset_path + "xray_articles.json"
        self.__embedding_path = dataset_path + "xray_articles_with_embeddings2.csv"
        self.__index_path = dataset_path + "xray_articles_vector_index.pkl"
        self.__chunked_articles_csv_path = dataset_path + "xray_articles_chunked.csv"
        self.__chunked_articles_json_path = dataset_path + "xray_articles_chunked.json"
        self.__chunking_max_tokens = chunking_max_tokens
        self.__num_matches = num_matches
        self.__use_openai = use_openai
        self.__xray_chunked_articles = self.__load_chunked_xray_articles_csv()

    def __load_xray_articles(self) -> dict:
        """
        Loads and returns the raw xray articles into a dictionary

        Raises:
            ValueError: If the raw article data is not found.
        """
        if not os.path.exists(self.__articles_path):
            raise ValueError("Articled file not found!")
        with open(self.__articles_path, "r", encoding='utf-8') as f:
            return json.load(f)

    def __load_chunked_xray_articles_csv(self) -> pd.DataFrame:
        """
        Loads and returns the chunked xray articles from __chunked_articles_csv_path as a DataFrame
        """
        if not os.path.exists(self.__chunked_articles_csv_path):
            self.__create_chunked_dataset()
        return pd.read_csv(self.__chunked_articles_csv_path)

    def __convert_json_to_df(self, json_data=None) -> pd.DataFrame:
        """
        Returns json_data (or the raw xray articles if no json_data provided) as a DataFrame

        Args:
            json_data [optional] (Dict): If not None will be converted to a DataFrame

        Raises:
            ValueError: If the raw article data is not found.
        """
        if json_data is None:
            df = pd.DataFrame(
                self.__load_xray_articles()
            )
        else:
            df = pd.DataFrame(json_data)
        return df

    def __save_json_as_csv(self) -> None:
        """
        Converts __chunked_articles_json_path from a JSON file into a CSV file and saves it at __chunked_articles_csv_path.
        """
        df = None
        with open(self.__chunked_articles_json_path, "r", encoding='utf-8') as f:
            df = pd.read_json(f)
        df.to_csv(self.__chunked_articles_csv_path)

    def __chunk_text(self, tokens) -> list:
        """
        Splits a list of tokens into chunks of size __chunking_max_tokens attribute, returning the list of chunks.

        Args:
            tokens (list of str): The list of tokens to be chunked.
        """
        return [tokens[i:i+self.__chunking_max_tokens] for i in range(0, len(tokens), self.__chunking_max_tokens)]

    chunk_types = {
        "character_splitter": CharacterTextSplitter,
        "nltk": NLTKTextSplitter,
        "spacy": SpacyTextSplitter
    }

    def __chunk(self, page, chunk_type="character_splitter"):
        """
        Types:
        "character_splitter": CharacterTextSplitter
        "nltk": NLTK
        "spacy": spacy
        """
        if chunk_type not in self.chunk_types:
            print("Type doesn't exist. Using default...")
            chunk_type = "character_splitter"

        text_splitter = self.chunk_types[chunk_type]()
        docs = text_splitter.split_text(page)
        return docs

    def __create_chunked_dataset(self) -> None:
        """
        Creates a dataset of chunked articles from the raw xray articles, and saves it in JSON and CSV formats.
        """
        df = self.__convert_json_to_df()
        chunked_dataset = []
        for _, row in df.iterrows():
            j = 0
            # fulltext is an array of strings
            full_text = " ".join(row['FullText']).split(" ")

            # tokenize
            for chunk in self.__chunk_text(full_text):
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
        with open(self.__chunked_articles_json_path, "w") as f:
            json.dump(chunked_dataset, f)

        self.__save_json_as_csv()

    def __run_batch_embeddings_ingestion(self) -> None:
        """
        Generates embeddings for the chunked xray articles using either OpenAI or HuggingFace models, 
        and saves the embedded dataset as a CSV.
        """
        df = self.__xray_chunked_articles
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
            embedding_result = None
            if self.__use_openai:
                # Logic for OpenAI embeddings
                embedding_result = self.__embedding_open.embed_documents(
                    pub_id_to_chunks[pub_id])
            else:
                # Logic for HuggingFace embeddings
                embedding_result = self.__embeddings_hugging.embed_documents(
                    pub_id_to_chunks[pub_id])
            embeddings_as_lists.extend([list(embedding)
                                       for embedding in embedding_result])

        new_df['embedding'] = embeddings_as_lists
        new_df.to_csv(self.__embedding_path, index=True)

    def __cosine_similarity(self, v1, v2) -> float:
        """
        returns cosine similarity of vectors v1 and v2

        Args:
        v1 (list of float): The first vector.
        v2 (list of float): The second vector.
        """
        return 1 - spatial.distance.cosine(v1, v1)

    def __build_vector_index(self) -> None:
        """
        Builds a vector index from the embedded xray articles and saves it as a pickle file.
        """
        if not os.path.exists(self.__embedding_path):
            self.__run_batch_embeddings_ingestion()
        df = pd.read_csv(self.__embedding_path)
        df = df.reset_index()
        index = [(row['index'], row['embedding'], row['text'])
                 for _, row in df.iterrows()]
        # make embeddings into list of floats
        index = [(row[0], [float(x) for x in row[1][1:-1].split(",")], row[2])
                 for row in index]
        # save as a pickle
        with open(self.__index_path, "wb") as f:
            pickle.dump(index, f)

    def __retrieve_vector_index(self) -> (list, time):
        """
        Retrieves the vector index of embedded articles, building it if it doesn't exist.

        Returns:
            tuple: A tuple containing the list of embeddings and the time taken to load them.
        """
        list_of_embeddings = []
        start = time.time()
        if not os.path.exists(self.__index_path):
            self.__build_vector_index()
        with open(self.__index_path, "rb") as f:
            list_of_embeddings = pickle.load(f)

        return list_of_embeddings, time.time() - start

    def __silent_remove(self, path) -> None:
        """
        Removes a file silently. If the file does not exist, it does nothing.

        Args:
            path (str [Path]): The path to the file to be removed.
        """
        try:
            os.remove(path)
        except OSError as e:
            if e.errno != errno.ENOENT:
                raise

    def __clean_directory(self) -> None:
        """
        Cleans up the data directory by removing the embeddings, index, and chunked articles.
        """
        self.__silent_remove(self.__embedding_path)
        self.__silent_remove(self.__index_path)

    def get_similar_documents(self, query) -> list[tuple[float, int, str]]:
        """
        Retrieves documents similar to a given query based on cosine similarity of embeddings.

        Args:
            query (str): The query string to find similar documents for.

        Returns:
            list: A sorted list of tuples containing similarity scores, indices, and text chunks.
        """
        embeddings, _ = self.__retrieve_vector_index()
        if self.__use_openai:
            # Logic for OpenAI embeddings
            embedding_result = self.__embedding_open.embed_query(query)
        else:
            # Logic for HuggingFace embeddings
            embedding_result = self.__embeddings_hugging.embed_query(query)
        similarity_scores = []
        for (i, embedding, chunk) in embeddings:
            similarity_scores.append(
                (self.__cosine_similarity(embedding_result, embedding), i, chunk))
        sorted_similarity_scores = sorted(
            similarity_scores, key=lambda x: x[0], reverse=True)
        results = sorted_similarity_scores[:self.__num_matches]
        return results

    def clear(self) -> None:
        """
        Destroys the current instance by cleaning up all associated files and directories.
        """
        self.__clean_directory()
