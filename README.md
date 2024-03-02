# X-Ray-Tooling

## Setup Instructions

To set up the environment and dependencies for the project, follow these steps:

1. Install Python and pip on your system if they are not already installed.
2. Run the setup script: `./setup.sh`
3. Obtain a Cohere API key and set it as an environment variable `COHERE_API_KEY` into a `.env` file within the root directory.
4. (Optional) Obtain an OpenAI API key and set it as an environment variable `OPENAI_API_KEY` in the `.env` file within the root directory.
5. Run: npm install

## Running the Backend and Frontend

To start the backend and frontend services for the X-Ray-Tooling application, follow these steps:

1. Navigate to the backend directory and start the FastAPI server:

   ```
   cd ./xray_tooling_apis
   uvicorn app:app --reload
   ```

2. In a new terminal, navigate to the frontend directory and start the React application:
   ```
   cd ../xray-tooling-frontend
   npm install
   npm start
   ```

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

   `python chroma_embedding.py --use_openai build`

2. **Loading the Chroma DB:**
   To load the existing Chroma database, use:

   `python chroma_embedding.py load`

3. **Retrieving Documents Based on a Query with OpenAI Embeddings:**
   For retrieving documents similar to a provided query using OpenAI embeddings, execute:

   `python chroma_embedding.py --use_openai retrieve "your query here"`

4. **Reuploading Documents to Chroma:**
   To clear the current Chroma database and re-upload documents, run:

   `python chroma_embedding.py reupload`

5. **Clearing the Chroma DB:**
   To remove all documents from the Chroma database, use:
   `python chroma_embedding.py clear`

**Ensure you have activated the virtual environment and installed all dependencies before running these commands.**
