import re
from transformers import pipeline
from keybert import KeyBERT
from sklearn.feature_extraction.text import CountVectorizer
from wordfreq import zipf_frequency
from pathlib import Path
from document import DocumentProcessor


class KeywordExtractor:
    def __init__(self, model_name: str = 'distilbert-base-nli-mean-tokens'):
        self.model = KeyBERT(model_name)
        self.vectorizer = CountVectorizer(
            token_pattern=r"(?u)\b[^\W\d_]{2,}\b"
        )
        self.ner = pipeline("ner", model="dslim/bert-base-NER", aggregation_strategy="simple")


    def extract(self, text: str, top_n: int = 5) -> list[str]:
        results = self.model.extract_keywords(
            text,
            top_n=top_n,
            vectorizer=self.vectorizer,
        )
        return [kw for kw, _score in results]

    @staticmethod
    def is_macos_artifact(path: Path) -> bool:
        for part in path.parts:
            p = part.lower()
            if p.startswith("__macosx") or p.startswith("._") or p == ".ds_store" or p == "__MACOSX":
                return True
        return False

    @staticmethod
    def folder_id_from_path(path: Path) -> str | None:
        for part in path.parts:
            if part[0].isdecimal():
                return part[:6]
        return None
    
    @staticmethod
    def _clean_name(name: str) -> str:
        name = re.sub(r'##', '', name)
        name = re.sub(r'\s+', ' ', name)
        name = name.strip()
        return name
    
    # TODO: NER extraction unreliable for complex names — consider alternative
    def extract_authors_from_file(self, text: str) -> str:
        pass

    @staticmethod
    def extract_authors_from_name(path: Path) -> str:
        """Parse 'ID-Surname_Name-surname_name-...' folder names into author strings."""
        for part in path.parts:
            if part[0].isdecimal():
                match = re.search(r'^\d+-(.*?)(?:-|$)', part)
                if match:
                    return match.group(1).replace('_', ' ').replace('-', ', ')
        return "Unknown Author"

    @staticmethod
    def extract_technology(path: Path) -> str:
        # extract python, D3, and others techlology
        pass

    def extract_keywords_from_file(self, file_path: Path, doc_processor: DocumentProcessor
        ) -> tuple[list[str], str, str] | tuple[None, None, None]:
        if self.is_macos_artifact(file_path):
            return None, None, None
        try:
            text = doc_processor.read_text(file_path)
            keywords = self.extract(text)
            return keywords
        except Exception as e:
            print(f"Error processing {file_path.name}: {e}")
            return [], ''

    def extract_metadata(self, file_path: Path):
        if self.is_macos_artifact(file_path):
            return None, None, None
        try:
            folder_id = self.folder_id_from_path(file_path)
            author = self.extract_authors_from_name(file_path)
            technology = self.extract_technology(file_path)
            return folder_id, author, technology
        except Exception as e:
            print(f"Error processing {file_path.name}: {e}")
            return [], ''

class KeywordFilter:
    def filter(self, keywords: set[str]) -> list[str]:
        return [kw for kw in keywords if self._is_valid(kw)]

    def _is_valid(self, kw: str) -> bool:
        if re.search(r"\d", kw):          # reject anything with digits
            return False
        if " " in kw:                      # multi-word phrases always pass
            return True
        return self._is_real_word(kw)

    def _is_real_word(self, word:    str) -> bool:
        return zipf_frequency(word, "en") > 2.5 or zipf_frequency(word, "cs") > 2.5 


class KeywordClassifier:
    def __init__(self, model_name: str = "cross-encoder/nli-deberta-v3-large", threshold: float = 0.5):
        self.classifier = pipeline("zero-shot-classification", model=model_name)
        self.threshold = threshold
        self._cache: dict[str, str] = {}  # simple dict cache

    def categorize(
        self, keywords: set[str], categories: dict[str, list[str]]
    ) -> dict[str, list[str]]:
        """Assign each keyword to the best-matching category."""
        categorized: dict[str, list[str]] = {cat: [] for cat in categories}
        labels = self._build_labels(categories)

        for kw in keywords:
            cat = self._classify_single(kw, labels)
            categorized.setdefault(cat, []).append(kw)
        return categorized

    def _classify_single(self, word: str, candidate_labels: list[str]) -> str:
        if word in self._cache:
            return self._cache[word]
        
        result = self.classifier(word, candidate_labels=candidate_labels, multi_label=False)
        best_label: str = result["labels"][0]
        best_score: float = result["scores"][0]
        if best_score >= self.threshold:
            return best_label.split(":")[0]
        return "UNDEFINED"

    @staticmethod
    def _build_labels(categories: dict[str, list[str]]) -> list[str]:
        labels = []
        for cat, words in categories.items():
            if words:
                label = f"{cat}: {', '.join(str(w) for w in words)}"
            else:
                label = cat
            labels.append(label)
        return labels