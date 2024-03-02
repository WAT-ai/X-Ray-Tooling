## Citations of datasets:

Fractures:

General information on hand fractures. General information on hand fractures | The British Society for Surgery of the Hand. (n.d.). https://www.bssh.ac.uk/patients/conditions/31/general_information_on_hand_fractures#:~:text=The%20initial%20treatment%20is%20likely,to%20help%20reduce%20the%20swelling.

Sprains:

Mayo Foundation for Medical Education and Research. (2022, October 27). Sprains. Mayo Clinic. https://www.mayoclinic.org/diseases-conditions/sprains/symptoms-causes/syc-20377938

Bruises:
professional, C. C. medical. (n.d.). Bruises (ecchymosis): Symptoms, causes, treatment &amp; prevention. Cleveland Clinic. https://my.clevelandclinic.org/health/diseases/15235-bruises

## To do:

1. Ingest more datasets for RAG
2. Preprocessing:
   - Chunk documents into smaller documents?
   - improve document format to include more metadata
   - integrate document embeddings beforehand to reduce context going into RAG on our end
   - automate citations
3. Build a webscraping tool to automage ingestion
4. Integrate with GPT api to compare performance
5. Prompt engineering to iterate on quality of cohere calls

# To run a chat:

`python RAG/chat_interface.py`
Use the following flags to change options:

`--use_cohere` will use cohere instead of open ai as the llm.

`--use_chroma` will use the chroma embedding db instead of a vector index

`--use_openai_embeddings` will use open ai embeddings instead of huggingface embeddings

# To run a chat through cli:

`python RAG/chat_interface.py`
Use the following flags to change options:

`--use_cohere` will use cohere instead of open ai as the llm.

`--use_chroma` will use the chroma embedding db instead of a vector index

`--use_openai_embeddings` will use open ai embeddings instead of huggingface embeddings

## Using the ChromaEmbedding Script

The `ChromaEmbedding` script allows for various operations related to embedding models and Chroma database management. Below are the steps to run the script for different tasks:

1. **Building the Chroma DB with OpenAI Embeddings:**
   To initialize and populate the Chroma database using OpenAI embeddings, run:

   `python RAG/chroma_embedding.py --use_openai build`

2. **Loading the Chroma DB:**
   To load the existing Chroma database, use:

   `python RAG/chroma_embedding.py load`

3. **Retrieving Documents Based on a Query with OpenAI Embeddings:**
   For retrieving documents similar to a provided query using OpenAI embeddings, execute:

   `python RAG/chroma_embedding.py --use_openai retrieve "your query here"`

4. **Reuploading Documents to Chroma:**
   To clear the current Chroma database and re-upload documents, run:

   `python RAG/chroma_embedding.py reupload`

5. **Clearing the Chroma DB:**
   To remove all documents from the Chroma database, use:
   `python RAG/chroma_embedding.py clear`

**Ensure you have activated the virtual environment and installed all dependencies before running these commands.**
