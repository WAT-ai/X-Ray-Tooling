# README.md

## Citations of datasets

### Fractures:

General information on hand fractures. General information on hand fractures | The British Society for Surgery of the Hand. (n.d.). [Source](https://www.bssh.ac.uk/patients/conditions/31/general_information_on_hand_fractures#:~:text=The%20initial%20treatment%20is%20likely,to%20help%20reduce%20the%20swelling).

### Sprains:

Mayo Foundation for Medical Education and Research. (2022, October 27). Sprains. Mayo Clinic. [Source](https://www.mayoclinic.org/diseases-conditions/sprains/symptoms-causes/syc-20377938).

### Bruises:

Professional, C. C. Medical. (n.d.). Bruises (ecchymosis): Symptoms, causes, treatment & prevention. Cleveland Clinic. [Source](https://my.clevelandclinic.org/health/diseases/15235-bruises).

## To Do:

1. **Ingest more datasets for RAG**
2. **Preprocessing:**
   - Chunk documents into smaller documents.
   - Improve document format to include more metadata.
   - Integrate document embeddings beforehand to reduce context going into RAG on our end.
   - Automate citations.
3. **Build a webscraping tool to automate ingestion.**
4. **Integrate with GPT API to compare performance.**
5. **Prompt engineering to iterate on the quality of cohere calls.**

## Using the ChromaEmbedding Script

The `ChromaEmbedding` script allows for various operations related to embedding models and Chroma database management. Below are the steps to run the script for different tasks:

### 1. Building the Chroma DB with OpenAI Embeddings:

To initialize and populate the Chroma database using OpenAI embeddings, run:

```sh
python RAG/chroma_embedding.py --use_openai build
```

### 2. Loading the Chroma DB:

To load the existing Chroma database, use:

```sh
python RAG/chroma_embedding.py load
```

### 3. Retrieving Documents Based on a Query with OpenAI Embeddings:

For retrieving documents similar to a provided query using OpenAI embeddings, execute:

```sh
python RAG/chroma_embedding.py --use_openai retrieve "your query here"
```

### 4. Reuploading Documents to Chroma:

To clear the current Chroma database and re-upload documents, run:

```sh
python RAG/chroma_embedding.py reupload
```

### 5. Clearing the Chroma DB:

To remove all documents from the Chroma database, use:

```sh
python RAG/chroma_embedding.py clear
```

**Ensure you have activated the virtual environment and installed all dependencies before running these commands.**

## Using the RaptorEmbedding Script

The `RaptorEmbedding` script provides an advanced approach to building and managing a hierarchical tree structure of documents and collapsing it into a Chroma database. Below are the steps to run the script for different tasks:

### 1. Building and Collapsing the Tree into Chroma DB:

To build a hierarchical tree and collapse it into a Chroma database, run:

```sh
python RAG/raptor_embedding.py build --level 1 --n_levels 3
```

### 2. Loading the Collapsed Tree from Chroma DB:

To load the collapsed tree from the Chroma database, use:

```sh
python RAG/raptor_embedding.py load
```

### 3. Retrieving Documents Based on a Query:

For retrieving documents similar to a provided query using the hierarchical structure, execute:

```sh
python RAG/raptor_embedding.py retrieve "your query here" --top_n 3 --search_kwargs 20 --rerank True
```

### 4. Clearing the Chroma DB:

To remove all documents from the Chroma database, use:

```sh
python RAG/raptor_embedding.py clear
```

### 5. Deleting the Chroma DB Folder:

To delete the Chroma database folder, run:

```sh
python RAG/raptor_embedding.py destroy
```

**Ensure you have activated the virtual environment and installed all dependencies before running these commands.**

## Running the Chat Interface

To run a chat using the chat interface, use the following command:

```sh
python RAG/chat_interface.py
```

### Changing Options:

- `--use_cohere` will use Cohere instead of OpenAI as the LLM.
- `--use_chroma` will use the Chroma embedding DB instead of a vector index.
- `--use_openai_embeddings` will use OpenAI embeddings instead of HuggingFace embeddings.

For running a chat through CLI:

```sh
python RAG/chat_interface.py --use_cohere --use_chroma --use_openai_embeddings
```

By following these instructions, you can effectively manage and utilize the embedding models and Chroma database for various applications.
