from pathlib import Path

from keybert import KeyBERT
from transformers import pipeline
from sklearn.feature_extraction.text import CountVectorizer

from utils import PathParser, JsonYamlManager
from utils.paths import TECH_TERMS_YAML, TAGS_YAML


class MetadataExtractor:
    """
    Extracts structured information (keywords, tags, metadata)
    from report texts.
    """
    def __init__(self, model_name: str = 'all-mpnet-base-v2'):
        self.model = KeyBERT(model_name)
        self.vectorizer = CountVectorizer(
            token_pattern=r"(?u)\b[^\W\d_]{2,}\b"
        )
        self.ner = pipeline("ner", model="dslim/bert-base-NER", aggregation_strategy="simple")

    def _predict_keywords(self, text: str, top_n: int = 5) -> list[str]:
        """
        Extracts keywords using KeyBERT.

        Args:
            text (str): Input text
            top_n (int): Number of keywords to extract

        Returns:
            list[str]: List of extracted keywords
        """
        results = self.model.extract_keywords(
            text,
            top_n=top_n,
            vectorizer=self.vectorizer,
        )
        return [kw for kw, _ in results]

    def extract_technologies(self, text: str) -> list[str]:
        """
        Extracts technologies based on predefined YAML mapping.

        Each technology contains example keywords.
        If any example appears in text, the technology is assigned.

        Args:
            text (str): Input text

        Returns:
            list[str]: List of detected technologies
        """
        tech_terms = JsonYamlManager.load_yaml(TECH_TERMS_YAML) 
        found = []
        for canonical, aliases in tech_terms.items():
            if any(alias.lower() in text for alias in (aliases or [])):
                found.append(canonical)
        return found

    def extract_keywords(self, text: str 
        ) -> dict[str, list[str]] | None:
        """
        Extracts keywords from text.

        Combines:
        - ML-based keyword extraction (KeyBERT)
        - Rule-based keyword matching (YAML)

        Args:
            text (str): Input text

        Returns:
            dict: {"keywords": [...]}
            None: If extraction fails
        """
        try:
            keywords: list[str] = (self._predict_keywords(text))
            extracted_keywords: list[str] = self._match_known_keywords(text)
            merged = set(keywords + extracted_keywords)
            return {"keywords": list(merged)} 
        except Exception as e:
            print(f"Error processing keywords: {e}")
            return None

    def extract_tags(self, text: str) -> list[str]:
        """
        Extracts tags based on predefined YAML mapping.

        Each tag contains example keywords.
        If any example appears in text, the tag is assigned.

        Args:
            text (str): Input text

        Returns:
            list[str]: List of detected tags
        """
        tags = JsonYamlManager.load_yaml(TAGS_YAML)
        found_tags = set()
        for tag, examples in tags.items():
            for example in examples:
                if example.lower() in text:
                    found_tags.add(tag)
        return list(found_tags)

    def _match_known_keywords(self, text: str) -> list[str]:
        """
        Matches predefined keywords from YAML against the text.

        This ensures domain-specific keywords are always included.

        Args:
            text (str): Input text

        Returns:
            list[str]: Matched keywords
        """
        try:
            tags = JsonYamlManager.load_yaml(TAGS_YAML)
            found_keywords = set()
            for _, examples in tags.items():
                for example in examples:
                    if example.lower() in text:
                        found_keywords.add(example)
            return list(found_keywords)
        except Exception as e:
            print(f"Error processing known keywords: {e}")
            return []

    def extract_metadata(self, file_path: Path
                         ) -> dict[str, list[str]]:
        """
        Extracts structured metadata from parsed markdown content.

        Includes:
        - Authors (cleaned list)
        - Technologies (cleaned list)
        - Tags
        - Text

        Args:
            file_path (Path): Path to the files

        Returns:
            dict: Metadata dictionary
        """        
        try:
            from processors import DocumentProcessor
            doc_processor = DocumentProcessor()
            text = doc_processor.read_text(file_path).lower()
            return {
                "author": PathParser.extract_authors(file_path),
                "technology": self.extract_technologies(text),
                "tags": self.extract_tags(text),
                "text": text
            }
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            return {"author": "", "technology": "", "tags": "", "text": ""}