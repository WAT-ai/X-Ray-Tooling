from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
import umap
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from sklearn.mixture import GaussianMixture
from tqdm import tqdm


class TreeBuilder:

    def __init__(self,
                 texts: Optional[List[str]] = None,
                 model=None,
                 embd=None,
                 random_seed: int = 224) -> None:
        self.random_seed = random_seed
        self.model = model
        self.embeddings = None
        self.texts = texts
        self.embd = embd

    def set_embedding_model(self, embd) -> None:
        self.embd = embd

    def set_language_model(self, model) -> None:
        self.model = model

    def set_texts(self, texts: List[str]) -> None:
        self.texts = texts

    def set_embeddings(self, embeddings: np.ndarray) -> None:
        self.embeddings = embeddings

    def global_cluster_embeddings(self,
                                  dim: int,
                                  n_neighbors: Optional[int] = None,
                                  metric: str = "cosine",
                                  ) -> np.ndarray:
        """
        Perform global dimensionality reduction on the embeddings using UMAP.

        Parameters:
        - dim: The target dimensionality for the reduced space.
        - n_neighbors: Optional; the number of neighbors to consider for each point.
                    If not provided, it defaults to the square root of the number of embeddings.
        - metric: The distance metric to use for UMAP.

        Returns:
        - A numpy array of the embeddings reduced to the specified dimensionality.
        """
        if self.embeddings is None:
            raise ValueError(
                "Embeddings must be set before calling this method.")

        if n_neighbors is None:
            n_neighbors = int((len(self.embeddings) - 1) ** 0.5)
        return umap.UMAP(
            n_neighbors=n_neighbors, n_components=dim, metric=metric
        ).fit_transform(self.embeddings)

    def local_cluster_embeddings(self,
                                 embeddings: np.ndarray, dim: int, num_neighbors: int = 10, metric: str = "cosine"
                                 ) -> np.ndarray:
        """
        Perform local dimensionality reduction on the embeddings using UMAP, typically after global clustering.

        Parameters:
        - embeddings: The input embeddings as a numpy array.
        - dim: The target dimensionality for the reduced space.
        - num_neighbors: The number of neighbors to consider for each point.
        - metric: The distance metric to use for UMAP.

        Returns:
        - A numpy array of the embeddings reduced to the specified dimensionality.
        """
        return umap.UMAP(
            n_neighbors=num_neighbors, n_components=dim, metric=metric
        ).fit_transform(embeddings)

    def get_optimal_clusters(self,
                             embeddings: np.ndarray, max_clusters: int = 50, random_state: int = 224
                             ) -> int:
        """
        Determine the optimal number of clusters using the Bayesian Information Criterion (BIC) with a Gaussian Mixture Model.

        Parameters:
        - embeddings: The input embeddings as a numpy array.
        - max_clusters: The maximum number of clusters to consider.
        - random_state: Seed for reproducibility.

        Returns:
        - An integer representing the optimal number of clusters found.
        """
        max_clusters = min(max_clusters, len(embeddings))
        n_clusters = np.arange(1, max_clusters)
        bics = []
        for n in tqdm(n_clusters, desc="Finding optimal clusters"):
            gm = GaussianMixture(n_components=n, random_state=random_state)
            gm.fit(embeddings)
            bics.append(gm.bic(embeddings))
        return n_clusters[np.argmin(bics)]

    def GMM_cluster(self, embeddings: np.ndarray, threshold: float, random_state: int = 224) -> Tuple[List[np.ndarray], int]:
        """
        Cluster embeddings using a Gaussian Mixture Model (GMM) based on a probability threshold.

        Parameters:
        - embeddings: The input embeddings as a numpy array.
        - threshold: The probability threshold for assigning an embedding to a cluster.
        - random_state: Seed for reproducibility.

        Returns:
        - A tuple containing the cluster labels and the number of clusters determined.
        """
        n_clusters = self.get_optimal_clusters(embeddings)
        gm = GaussianMixture(n_components=n_clusters,
                             random_state=random_state)
        gm.fit(embeddings)
        probs = gm.predict_proba(embeddings)
        labels = [np.where(prob > threshold)[0] for prob in probs]
        return labels, n_clusters

    def perform_clustering(self,
                           dim: int,
                           threshold: float,
                           ) -> List[np.ndarray]:
        """
        Perform clustering on the embeddings by first reducing their dimensionality globally, then clustering
        using a Gaussian Mixture Model, and finally performing local clustering within each global cluster.

        Parameters:
        - dim: The target dimensionality for UMAP reduction.
        - threshold: The probability threshold for assigning an embedding to a cluster in GMM.

        Returns:
        - A list of numpy arrays, where each array contains the cluster IDs for each embedding.
        """
        if self.embeddings is None:
            raise ValueError(
                "Embeddings must be set before calling this method.")
        if len(self.embeddings) <= dim + 1:
            # Avoid clustering when there's insufficient data
            return [np.array([0]) for _ in range(len(self.embeddings))]

        # Global dimensionality reduction
        reduced_embeddings_global = self.global_cluster_embeddings(dim)
        # Global clustering
        global_clusters, n_global_clusters = self.GMM_cluster(
            reduced_embeddings_global, threshold
        )

        all_local_clusters = [np.array([])
                              for _ in range(len(self.embeddings))]
        total_clusters = 0

        # Iterate through each global cluster to perform local clustering
        for i in tqdm(range(n_global_clusters), desc="Local clustering"):
            # Extract embeddings belonging to the current global cluster
            global_cluster_embeddings_ = self.embeddings[
                np.array([i in gc for gc in global_clusters])
            ]

            if len(global_cluster_embeddings_) == 0:
                continue
            if len(global_cluster_embeddings_) <= dim + 1:
                # Handle small clusters with direct assignment
                local_clusters = [np.array([0])
                                  for _ in global_cluster_embeddings_]
                n_local_clusters = 1
            else:
                # Local dimensionality reduction and clustering
                reduced_embeddings_local = self.local_cluster_embeddings(
                    global_cluster_embeddings_, dim
                )
                local_clusters, n_local_clusters = self.GMM_cluster(
                    reduced_embeddings_local, threshold
                )

            # Assign local cluster IDs, adjusting for total clusters already processed
            for j in range(n_local_clusters):
                local_cluster_embeddings_ = global_cluster_embeddings_[
                    np.array([j in lc for lc in local_clusters])
                ]
                indices = np.where(
                    (self.embeddings ==
                     local_cluster_embeddings_[:, None]).all(-1)
                )[1]
                for idx in indices:
                    all_local_clusters[idx] = np.append(
                        all_local_clusters[idx], j + total_clusters
                    )

            total_clusters += n_local_clusters

        return all_local_clusters

    def embed(self) -> np.ndarray:
        """
        Generate embeddings for the set texts.

        This function assumes the existence of an `embd` object with a method `embed_documents`
        that takes a list of texts and returns their embeddings.

        Returns:
        - numpy.ndarray: An array of embeddings for the given text documents.
        """
        if self.texts is None:
            raise ValueError("Texts must be set before calling this method.")
        if self.embd is None:
            raise ValueError(
                "Embedding model must be set before calling this method.")
        text_embeddings = self.embd.embed_documents(self.texts)
        self.embeddings = np.array(text_embeddings)
        return self.embeddings

    def embed_cluster_texts(self) -> pd.DataFrame:
        """
        Embeds the set texts and clusters them, returning a DataFrame with texts, their embeddings, and cluster labels.

        This function combines embedding generation and clustering into a single step.

        Returns:
        - pandas.DataFrame: A DataFrame containing the original texts, their embeddings, and the assigned cluster labels.
        """
        if self.texts is None:
            raise ValueError("Texts must be set before calling this method.")
        self.embed()  # Generate embeddings
        cluster_labels = self.perform_clustering(
            10, 0.1
        )  # Perform clustering on the embeddings
        df = pd.DataFrame()  # Initialize a DataFrame to store the results
        df["text"] = self.texts  # Store original texts
        # Store embeddings as a list in the DataFrame
        df["embd"] = list(self.embeddings)
        df["cluster"] = cluster_labels  # Store cluster labels
        return df

    def fmt_txt(self, df: pd.DataFrame) -> str:
        """
        Formats the text documents in a DataFrame into a single string.

        Parameters:
        - df: DataFrame containing the 'text' column with text documents to format.

        Returns:
        - A single string where all text documents are joined by a specific delimiter.
        """
        unique_txt = df["text"].tolist()
        return "--- --- \n --- --- ".join(unique_txt)

    def embed_cluster_summarize_texts(self,
                                      level: int,
                                      chunk_size: int = 1500  # New parameter for chunk size
                                      ) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Embeds, clusters, and summarizes a list of texts. This function first generates embeddings for the texts,
        clusters them based on similarity, expands the cluster assignments for easier processing, and then summarizes
        the content within each cluster.

        Parameters:
        - level: An integer parameter that could define the depth or detail of processing.
        - chunk_size: The maximum length of each text chunk for summarization.

        Returns:
        - Tuple containing two DataFrames:
        1. The first DataFrame (`df_clusters`) includes the original texts, their embeddings, and cluster assignments.
        2. The second DataFrame (`df_summary`) contains summaries for each cluster, the specified level of detail,
            and the cluster identifiers.
        """
        df_clusters = self.embed_cluster_texts()

        expanded_list = []

        for index, row in tqdm(df_clusters.iterrows(), desc="Expanding clusters", total=df_clusters.shape[0]):
            for cluster in row["cluster"]:
                expanded_list.append(
                    {"text": row["text"], "embd": row["embd"],
                        "cluster": cluster}
                )

        expanded_df = pd.DataFrame(expanded_list)
        all_clusters = expanded_df["cluster"].unique()

        print(f"--Generated {len(all_clusters)} clusters--")

        template = """Here are documents related to X-ray imaging and diagnosis.

            The information may include, but not limited to:
            - recovery time period
            - rehabilitation steps
            - restrictions during the recovery period
            - general medical advice related to x-rays
            - information about conditions and injuries diagnosable by x-rays

            Documentation:
            {context}
            """

        prompt = ChatPromptTemplate.from_template(template)

        chain = prompt | self.model | StrOutputParser()

        if self.model is None:
            raise ValueError(
                "Language model must be set before calling this method.")

        summaries = []
        for i in tqdm(all_clusters, desc="Generating summaries"):
            df_cluster = expanded_df[expanded_df["cluster"] == i]
            formatted_txt = self.fmt_txt(df_cluster)

            chunks = self.__chunk_text(formatted_txt, chunk_size)
            chunk_summaries = [chain.invoke(
                {"context": chunk}) for chunk in chunks]
            combined_summary = " ".join(chunk_summaries)
            summaries.append(combined_summary)

        df_summary = pd.DataFrame(
            {
                "summaries": summaries,
                "level": [level] * len(summaries),
                "cluster": list(all_clusters),
            }
        )

        return df_clusters, df_summary

    def __chunk_text(self, text: str, max_length: int = 1500) -> List[str]:
        """
        Chunk the given text into smaller parts each not exceeding max_length tokens.

        Parameters:
        - text: The input text to be chunked.
        - max_length: The maximum length of each chunk.

        Returns:
        - A list of text chunks.
        """
        words = text.split()
        chunks = [' '.join(words[i:i + max_length])
                  for i in range(0, len(words), max_length)]
        return chunks

    def recursive_embed_cluster_summarize(self,
                                          level: int = 1, n_levels: int = 3
                                          ) -> Dict[int, Tuple[pd.DataFrame, pd.DataFrame]]:
        """
        Recursively embeds, clusters, and summarizes texts up to a specified level or until
        the number of unique clusters becomes 1, storing the results at each level.

        Parameters:
        - level: int, current recursion level (starts at 1).
        - n_levels: int, maximum depth of recursion.

        Returns:
        - Dict[int, Tuple[pd.DataFrame, pd.DataFrame]], a dictionary where keys are the recursion
          levels and values are tuples containing the clusters DataFrame and summaries DataFrame at that level.
        """
        results = {}  # Dictionary to store results at each level

        # Perform embedding, clustering, and summarization for the current level
        df_clusters, df_summary = self.embed_cluster_summarize_texts(level)

        # Store the results of the current level
        results[level] = (df_clusters, df_summary)

        # Determine if further recursion is possible and meaningful
        unique_clusters = df_summary["cluster"].nunique()
        if level < n_levels and unique_clusters > 1:
            # Use summaries as the input texts for the next level of recursion
            new_texts = df_summary["summaries"].tolist()
            self.set_texts(new_texts)
            next_level_results = self.recursive_embed_cluster_summarize(
                level + 1, n_levels
            )

            # Merge the results from the next level into the current results dictionary
            results.update(next_level_results)

        return results