from pathlib import Path

from keybert import KeyBERT
from transformers import pipeline
from sklearn.feature_extraction.text import CountVectorizer

from path_work import PathParser
from json_yaml_manager import JsonYamlManager
from keyword_filter import KeywordFilter


class KeywordExtractor:
    def __init__(self, model_name: str = 'distilbert-base-nli-mean-tokens'):
        self.model = KeyBERT(model_name)
        self.vectorizer = CountVectorizer(
            token_pattern=r"(?u)\b[^\W\d_]{2,}\b"
        )
        self.ner = pipeline("ner", model="dslim/bert-base-NER", aggregation_strategy="simple")

    def extract_keywords(self, text: str, top_n: int = 5) -> list[str]:
        results = self.model.extract_keywords(
            text,
            top_n=top_n,
            vectorizer=self.vectorizer,
        )
        return [kw for kw, _ in results]

    def extract_technology(self, file_path: Path, doc_processor) -> list[str]:
        tech_terms = JsonYamlManager.load_yaml("tech_terms.yaml") 
        text = doc_processor.read_text(file_path).lower()
        found = []
        for canonical, aliases in tech_terms.items():
            if any(alias.lower() in text for alias in (aliases or [])):
                found.append(canonical)
        return found

    def extract_keywords_from_file(self, file_path: Path, doc_processor 
        ) -> dict[str, list[str]] | None:
        try:
            text = doc_processor.read_text(file_path)
            keywords: list[str] = (self.extract_keywords(text))
            extracted_keywords: list[str] = self.extract_existing_keywords(file_path, doc_processor)
            merged = set(keywords + extracted_keywords)
            return {"keywords": list(merged)} 
        except Exception as e:
            print(f"Error processing {file_path.name}: {e}")
            return None

    def extract_tags(self, file_path: Path, doc_processor) -> list[str]:
        text = doc_processor.read_text(file_path).lower()
        tags = JsonYamlManager.load_yaml("tags.yaml")
        found_tags = set()
        for tag, examples in tags.items():
            for example in examples:
                if example.lower() in text:
                    found_tags.add(tag)
        return list(found_tags)

    def extract_existing_keywords(self, file_path: Path, doc_processor) -> list[str]:
        try:
            text = doc_processor.read_text(file_path).lower()
            tags = JsonYamlManager.load_yaml("tags.yaml")
            found_keywords = set()
            for _, examples in tags.items():
                for example in examples:
                    if example.lower() in text:
                        found_keywords.add(example)
            return list(found_keywords)
        except Exception as e:
            print(f"Error processing {file_path.name}: {e}")
            return []

    def extract_metadata(self, file_path: Path, doc_processor
                         ) -> dict[str, list[str]]:
        try:
            author = PathParser.extract_authors_from_name(file_path)
            technology = self.extract_technology(file_path, doc_processor)
            tags = self.extract_tags(file_path, doc_processor)
            return {
                "author": author,
                "technology": technology,
                "tags": tags
            }
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            return {"author": "", "technology": "", "tags": ""}