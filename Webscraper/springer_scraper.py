from dotenv import load_dotenv
import os
import requests
import json
from bs4 import BeautifulSoup
from langchain.document_loaders import UnstructuredPDFLoader, OnlinePDFLoader, TextLoader, PyPDFLoader, JSONLoader, UnstructuredExcelLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter, CharacterTextSplitter

load_dotenv()


class SpringerXrayScraper:
    """
    class for Springer API scraper
    """

    def __init__(self, api_key):
        self.api_key = api_key

    def search_springer_articles(self, query, max_results=10, save_folder="/Users/jeevanparmar/Desktop/co_ops/WAT.ai/X-Ray-Tooling/Webscraper/Springer_PDF"):
        """
        Retrieve up to max_results articles retrieved from query and 
        return a list of dictionaries of the metadata along with the full text if available.
        """
        article_metadata = self._perform_search(query, max_results)
        for article in article_metadata:
            # Assuming 'url' is the key for the full text link
            # and 'openaccess' indicates if the full text is freely available
            if 'openaccess' in article and article['openaccess']:
                full_text_link = self._get_full_text_link(article)
                if full_text_link:
                    article['FullText'] = self._fetch_full_article(
                        full_text_link, save_folder)
        return article_metadata

    def _get_full_text_link(self, article):
        """
        Extract the full text link list from the article metadata.
        """
        return article.get('url', [])

    def _perform_search(self, query, max_results):
        """
        search query into the Springer API and return up to max_results
        """
        try:
            url = "http://api.springer.com/metadata/json"
            params = {
                "q": query,
                "p": max_results,
                "api_key": self.api_key,
            }
            response = requests.get(url, params=params)
            response.raise_for_status()
            articles = response.json()["records"]
            return articles
        except requests.exceptions.HTTPError as e:
            print(f"HTTPError performing Springer search: {e}")
        except Exception as e:
            print(f"Error performing Springer search: {e}")
        return []

    def _fetch_full_article(self, url_list, save_folder):
        """
        Download the PDF of the article from the given URL list and save it in the specified folder.
        """
        # Extract the URL from the list of URL dictionaries
        actual_url = next(
            (link['value'] for link in url_list if link.get('format') == ''), None)
        if not actual_url:
            print("No valid URL found in URL list.")
            return None

        try:
            pdf_url = self._get_pdf_download_link(actual_url)

            if pdf_url:
                response = requests.get(pdf_url, stream=True)
                response.raise_for_status()

                # Extract filename from URL or set a default one
                filename = pdf_url.split('/')[-1] or 'downloaded_article.pdf'
                file_path = os.path.join(save_folder, filename)

                with open(file_path, 'wb') as f:
                    f.write(response.content)

                print(f"PDF downloaded successfully from URL: {pdf_url}")
                print(f"PDF downloaded successfully to: {file_path}")
                return file_path
        except Exception as e:
            print(f"Error downloading PDF: {e}")
        return None

    def _get_pdf_download_link(self, article_url):
        """
        Scrape the article page to find the PDF download link.
        """
        try:
            response = requests.get(article_url)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')
            pdf_link_element = soup.find('span', class_='c-pdf-download__text')

            if pdf_link_element and pdf_link_element.parent and pdf_link_element.parent.has_attr('href'):
                relative_pdf_url = pdf_link_element.parent['href']

                # Check if the URL is already absolute
                if relative_pdf_url.startswith(('http', 'https')):
                    return relative_pdf_url

                doi = article_url.replace("http://dx.doi.org/", "content/pdf/")

                relative_pdf_url = doi + ".pdf"

                # Correctly concatenate the base URL and the relative URL
                base_url = 'https://link.springer.com'
                if relative_pdf_url.startswith('/'):
                    return base_url + relative_pdf_url
                else:
                    return base_url + '/' + relative_pdf_url

        except Exception as e:
            print(f"Error while scraping PDF link: {e}")

        return None

    def save_to_json(self, data, filename):
        """
        Save the list of dictionaries to a json file after removing dictionaries where 'FullText' is None.
        """
        # Filter out dictionaries where 'FullText' is None
        filtered_data = [item for item in data if item.get(
            'FullText') is not None]

        # Saving the filtered data to a file
        with open(filename, 'w', encoding='utf-8') as file:
            json.dump(filtered_data, file, ensure_ascii=False, indent=2)

    def chunk_abstract_and_pdf(self, file_path):
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)

            for journal in data:
                pdf_path = journal["FullText"]
                if pdf_path is None:
                    continue
                docs_pdf = self._open_and_chunk_pdf(pdf_path)
                journal["FullText"] = docs_pdf
                abstract = journal["abstract"]
                texts_abstract = self._chunk_abstract(abstract)
                journal["abstract"] = texts_abstract

        self.save_to_json(data, file_path)

    def _chunk_abstract(self, abstract):
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=100, chunk_overlap=0)
        # Create a dummy Document object with the abstract as its text
        texts = text_splitter.create_documents([abstract])
        # Extract text from Document objects
        serialized_texts = [text.page_content for text in texts]
        return serialized_texts

    def _open_and_chunk_pdf(self, pdf_path):
        loader = PyPDFLoader(pdf_path)
        docs = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500, chunk_overlap=0)
        docs = text_splitter.split_documents(docs)

        # Convert Document objects to a JSON-serializable format, such as extracting text
        # Assuming each Document has a 'text' attribute
        serialized_docs = [{"content": doc.page_content, "page": doc.metadata["page"], "document_name": doc.metadata["source"].replace(
            "/Users/jeevanparmar/Desktop/co_ops/WAT.ai/X-Ray-Tooling/Webscraper/Springer_PDF/", "")}for doc in docs]
        return serialized_docs

    def reformat_json(self, json_path, output_path):
        # Open and read the JSON file
        with open(json_path, 'r', encoding='utf-8') as file:
            data = json.load(file)

        # New list to hold reformatted data
        reformatted_data = []

        for entry in data:
            # Extracting required fields
            title = entry.get('title', '')
            authors = [creator['creator']
                       for creator in entry.get('creators', [])]
            abstract = entry.get('abstract', [])
            journal_id = entry.get('journalId', '')
            publication_date = entry.get('publicationDate', '')
            full_text = entry.get('FullText', [])

            # Constructing the new dictionary format
            reformatted_entry = {
                "Title": title,
                "Authors": authors,
                "Abstract": abstract,
                "journalId": journal_id,
                "PublicationDate": publication_date,
                "FullText": full_text
            }

            reformatted_data.append(reformatted_entry)

            self.save_to_json(reformatted_data, output_path)


# Testing

if __name__ == "__main__":
    api_key = os.environ.get("SPRINGER_API_KEY")
    springer_scraper = SpringerXrayScraper(api_key)
    springer_articles = springer_scraper.search_springer_articles(
        'title:"X-ray" AND openaccess:"true"', max_results=200)
    springer_scraper.save_to_json(
        springer_articles, "/Users/jeevanparmar/Desktop/co_ops/WAT.ai/X-Ray-Tooling/Webscraper/springer_articles.json")
    springer_scraper.chunk_abstract_and_pdf(
        "/Users/jeevanparmar/Desktop/co_ops/WAT.ai/X-Ray-Tooling/Webscraper/springer_articles.json")
    springer_scraper.reformat_json("/Users/jeevanparmar/Desktop/co_ops/WAT.ai/X-Ray-Tooling/Webscraper/springer_articles.json",
                                   "/Users/jeevanparmar/Desktop/co_ops/WAT.ai/X-Ray-Tooling/Webscraper/reformated_springer_articles.json")
