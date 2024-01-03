# X-Ray-Tooling

To set up:

1. Install python and pip
2. `python -m venv venv`
3. `source venv/bin/activate`
4. `pip install -r requirements.txt`
5. Get Cohere API key and set it as an environment variable `COHERE_API_KEY` in a `.env` file


To setup backend and frontend:

1. cd ./xray-tooling-apis
2. uvicorn app:app --reload
3. cd ..
4. cd ./xray-tooling-frontend
5. npm start