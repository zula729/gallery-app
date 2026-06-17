import re
import logging

from keybert import KeyBERT
from transformers import pipeline
from sklearn.feature_extraction.text import CountVectorizer

from utils import JsonYamlManager
from utils.paths import TAGS_YAML

logger = logging.getLogger(__name__)


class MarkdownExtractor:
    """
    Extracts structured information (keywords, tags, metadata)
    from parsed Markdown content.

    Combines:
    - Keyword extraction (KeyBERT)
    - Named Entity Recognition (NER)
    - Rule-based matching using predefined YAML tags
    """
    def __init__(self, model_name: str = 'all-mpnet-base-v2'):
        self.model = KeyBERT(model_name)
        self.vectorizer = CountVectorizer(
            token_pattern=r"(?u)\b[^\W\d_]{2,}\b"
        )
        self.ner = pipeline("ner", model="dslim/bert-base-NER", aggregation_strategy="simple")

    def _get_field(self, content: dict, key: str, default: str = "") -> str:
        """
        Safely retrieves a field from parsed content.

        Logs a warning if the key is missing.

        Args:
            content (dict): Parsed markdown sections
            key (str): Field name
            default (str): Default value if key is missing

        Returns:
            str: Field value or default
        """
        value = content.get(key)
        if value is None:
            logger.warning(f"No '{key}' in content")
            return default
        return value

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
    
    def _match_known_keywords(self, content: str) -> list[str]:
        """
        Matches predefined keywords from YAML against the text.

        This ensures domain-specific keywords are always included.

        Args:
            content (str): Input text

        Returns:
            list[str]: Matched keywords
        """
        try:
            tags = JsonYamlManager.load_yaml(TAGS_YAML)
            found_keywords = set()
            for _, examples in tags.items():
                for example in examples:
                    if example.lower() in content:
                        found_keywords.add(example)
            return list(found_keywords)
        except Exception as e:
            logger.error(f"Error processing known keywords: {e}")
            return []
    
    def extract_keywords(self, content: dict) -> dict[str, list[str]] | None:
        """
        Extracts keywords from markdown content.

        Combines:
        - ML-based keyword extraction (KeyBERT)
        - Rule-based keyword matching (YAML)

        Args:
            content (dict): Parsed markdown sections

        Returns:
            dict: {"keywords": [...]}
            None: If extraction fails
        """
        try:
            text = (
                self._get_field(content, "Motivation") +
                self._get_field(content, "Project Description (short project description 150-200 words)")
            )
            keywords: list[str] = (self._predict_keywords(text))
            extracted_keywords: list[str] = self._match_known_keywords(text)
            merged = set(keywords + extracted_keywords)
            return {"keywords": list(merged)} 
        except Exception as e:
            logger.error(f"Error extracting keywords: {e}")
            return None
    
    def extract_tags(self, text: str):
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

    def extract_metadata(self, content: dict[str, str | None]):
        """
        Extracts structured metadata from parsed markdown content.

        Includes:
        - Project name
        - Authors (cleaned list)
        - Technologies (cleaned list)
        - Combined text for NLP
        - Project link
        - Tags

        Args:
            content (dict): Parsed markdown sections

        Returns:
            dict: Metadata dictionary
        """
        authors_raw = self._get_field(content, "Authors")
        tech_raw = self._get_field(content, "Used technologies")
        text = (
                self._get_field(content, "Motivation") +
                self._get_field(content, "Project Description (short project description 150-200 words)") +
                self._get_field(content, "Explanation of the design choices")
            )
        return {
            "name": self._get_field(content, "name"),
            "author": [line.lstrip("- ").strip() for line in authors_raw.split("\n") if line.strip()],
            "technology": [re.sub(r"^\d+\.\s+", "", line) for line in tech_raw.split("\n") if line.strip()],
            "text": text,
            "link": self._get_field(content, "Link on project"),
            "tags": self.extract_tags(text),

        }
