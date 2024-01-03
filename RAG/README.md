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

# To run a batch job of embeddings creation:

`python pubmed_embeddings.py --run_batch`

This should take around 10-20 minutes.

# To build vector index:

`python pubmed_embeddings.py --build_index`

This should be under a minute

# To run similarity search:

`python pubmed_embeddings.py --similarity_search`
