from dotenv import load_dotenv
import os
from Bio import Entrez
import requests
import json
load_dotenv()

""""
Must cite for using the pubmed bioc_url:
Comeau DC, Wei CH, Islamaj Doğan R, and Lu Z. PMC text mining subset in BioC: about 3 million full text articles and growing, Bioinformatics, btz070, 2019.
"""

class PubMedXrayScraper:
    """
    class for scraper
    """
    def __init__(self, email):
        self.email = email
        Entrez.email = email

    def search_xray_articles(self, query, max_results=10):
        """
        retrieve up to max_results articles retrieved from query and 
        return a list of dictionaries of the metadata and article text (messy text as of now)
        """
        search_results = self._perform_search(query, max_results)
        articles = self._fetch_articles_metadata(search_results)
        self._fetch_full_articles(articles)
        articles_filtered = [i for i in articles if i['FullText'] is not None]
        return articles_filtered

    def _perform_search(self, query, max_results):
        """
        search query into the pubmed db and return up to max_results
        returns a Bio.Entrez.Parser.ListElement of pubmed article ids (pmids) for the retrieved articles
        """
        try:
            handle = Entrez.esearch(db="pubmed", term=query, retmax=max_results)
            record = Entrez.read(handle)
            handle.close()
            return record["IdList"]
        except Exception as e:
            print(f"Error performing PubMed search: {e}")
            return []

    def _fetch_articles_metadata(self, pmids):
        """
        return the metadata for the articles in pmids as a list of dictionaries
        """
        articles = []
        for pmid in pmids:
            article_data = self._fetch_article_metadata(pmid)
            if article_data:
                articles.append(article_data)
        return articles

    def _fetch_article_metadata(self, pmid):
        """
        return the metadata for the article in pmid as a dictionary
        """
        try:
            handle = Entrez.efetch(db="pubmed", id=pmid, rettype="xml", retmode="text")
            record = Entrez.read(handle)
            handle.close()
            article_data = self._parse_article_metadata(record)
            return article_data
        except Exception as e:
            print(f"Error fetching article metadata for PMID {pmid}: {e}")
            return None

    def _parse_article_metadata(self, record):
        """
        parse the returned metadata in record
        record must be the return of a call to the pubmed api for metadata
        returns a dictionary of the metadata
        """
        date = record['PubmedArticle'][0]['PubmedData']['History'][0]
        article_data = {
            "Title": record['PubmedArticle'][0]['MedlineCitation']['Article']['ArticleTitle'],
            "Authors": [author['LastName'] + ' ' + author['Initials'] for author in record['PubmedArticle'][0]['MedlineCitation']['Article']['AuthorList']],
            "PMID": record['PubmedArticle'][0]['PubmedData']['ArticleIdList'][0],
            # "PublicationDate": record['PubmedArticle'][0]['PubmedData']['History'][0]['Year'],
            "PublicationDate": f"{date['Year']}/{date['Month'].zfill(2)}/{date['Day'].zfill(2)}",
        }
        return article_data

    def _fetch_full_articles(self, articles):
        """
        retrieve the full text of the articles in articles (parametere), where articles (parametere)
        contains the parsed metadata of a return from the pubmed api
        """
        for article in articles:
            pmid = article['PMID']
            article['FullText'] = self._fetch_full_article(pmid)

    def _fetch_full_article(self, pmid):
        """
        retrieve the full text of the article pmid as a string
        note: some articles do not have full text available... only some are publicly available
        """
        try:
            bioC_url = f"https://www.ncbi.nlm.nih.gov/research/bionlp/RESTful/pmcoa.cgi/BioC_json/{pmid}/unicode"
            response = requests.get(bioC_url)
            response_data = response.json()
            response_text_mod = []
            if response.status_code == 200:
                passages = response_data['documents'][0]['passages']
                response_text_mod = [passage['text'] for passage in passages if passage['infons']]
                return response_text_mod
            else:
                print(f"Error fetching full article for PMID {pmid}: {response.status_code}")
        except Exception as e:
            print(f"Error fetching full article for PMID {pmid}: {e}")
        return None

    def save_to_json(self, data, filename):
        """
        save the dictionary 
        """
        with open(filename, 'w', encoding='utf-8') as file:
            json.dump(data, file, ensure_ascii=False, indent=2)


#Testing:
if __name__ == "__main__":
    email = os.environ.get("PUBMED_EMAIL")  # I think the email address has to be associated with a pubmed account
    search_terms = """Fracture AND This is an open access article
    or Fracture healing AND This is an open access article
    or Broken bone AND This is an open access article
    or x-ray AND This is an open access article
    or xray AND This is an open access article"""
    xray_scraper = PubMedXrayScraper(email)
    xray_articles = xray_scraper.search_xray_articles(search_terms, max_results=20000)
    xray_scraper.save_to_json(xray_articles, "xray_articles.json")