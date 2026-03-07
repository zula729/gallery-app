import docx
import json
import firebase_admin
import sys
import io
import re
import pdfplumber
import yaml
import ocrmypdf
from wordfreq import zipf_frequency
from firebase_admin import credentials, db
from sklearn.feature_extraction.text import CountVectorizer
from transformers import pipeline
from keybert import KeyBERT
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

class DocumentProcessor:
    def read_text(self, file_path: Path) -> str:
        if file_path.suffix.lower() == '.pdf':
            return self._read_pdf(file_path)
        if file_path.suffix.lower() == '.docx':
            return self._read_docx(file_path)
        return ""

    def _read_pdf(self, path: Path) -> str:
        with pdfplumber.open(path) as pdf:
            return "".join(page.extract_text() or "" for page in pdf.pages)

    def _read_docx(self, path: Path):
        doc = docx.Document(path)
        return "".join(para.text for para in doc.paragraphs)


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
    
    def extract_authors_from_file(self, text: str) -> str:
        entities = self.ner(text)
        names = [
            self._clean_name(e["word"])
            for e in entities
            if e["entity_group"] == "PER"
        ]
        names = [n for n in names if len(n) > 1]  # drop single chars
        return ', '.join(dict.fromkeys(names)) if names else "Unknown Author"

    @staticmethod
    def extract_authors_from_name(path: Path) -> str:
        """Parse 'ID-Surname_Name-surname_name-...' folder names into author strings."""
        for part in path.parts:
            if part[0].isdecimal():
                match = re.search(r'^\d+-(.*?)(?:-|$)', part)
                if match:
                    return match.group(1).replace('_', ' ').replace('-', ', ')
        return "Unknown Author"

    def extract_from_file(
            self,
            file_path: Path,
            doc_processor: DocumentProcessor
        ) -> tuple[list[str], str, str] | tuple[None, None, None]:
        if self.is_macos_artifact(file_path):
            return None, None, None
        try:
            folder_id = self.folder_id_from_path(file_path)
            text = doc_processor.read_text(file_path)
            keywords = self.extract(text)
            ## Tady musim pridat rozlisovani podle skupinovych projektu a single, zatim funguje jen single
            author = self.extract_authors_from_name(file_path)
            return keywords, folder_id, author
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

class FirebaseClient:
    DB_URL = "https://visualization-88a6b-default-rtdb.europe-west1.firebasedatabase.app/"
    REF_PATH = "Keywords from projects"

    def __init__(self, cred_path: str = "credentials.json"):
        if not firebase_admin._apps:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, {"databaseURL": self.DB_URL})
        self.ref = db.reference(self.REF_PATH)

    def upload(self, files: list[Path], extractor: KeywordExtractor, doc_processor: DocumentProcessor, keyword_filer: KeywordFilter):
        for file_path in files:
            keywords, folder_id, author = extractor.extract_from_file(file_path, doc_processor)
            if keywords is None:
                print("NONE VALUE TO DATA BASE")
                print(file_path)
                continue
            if keywords == "":
                print("WRONG PDF OR DOCX FILE")
                print(file_path)
                continue
            keywords = keyword_filer.filter(keywords)
            self.ref.child(f"{folder_id}").set({
                "keywords": keywords,
                "semester": self._get_semester(file_path),
                "author": author
            })

    @staticmethod
    def _get_semester(path: Path) -> str | None:
        for part in path.parts:
            if part.lower().startswith("podzim"):
                return part
        return None

    def fetch_all(self) -> dict:
        return self.ref.get() or {}

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


class ProjectUtils:
    @staticmethod
    def save_keywords_json(
        files: list[Path],
        extractor: KeywordExtractor,
        doc_processor: DocumentProcessor,
        keyword_filter: KeywordFilter,
        output_path: str = "keywords.json",
    ) -> None:
        keywords_dict: dict[str, list[str]] = {}
        for file_path in files:
            keywords, folder_id, author= extractor.extract_from_file(file_path, doc_processor)
            if keywords is None:
                print("NONE VALUE TO DATA BASE")
                print(file_path)
                continue
            if keywords == "":
                print("WRONG PDF OR DOCX FILE")
                print(file_path)
                continue 
            keywords = keyword_filter.filter(keywords)
            if folder_id is not None:
                keywords_dict[folder_id] = keywords, author or []
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(keywords_dict, f, ensure_ascii=False, indent=2)

    @staticmethod
    def load_json(file_path: str) -> dict:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    @staticmethod
    def load_categories(yaml_path: str) -> dict[str, list[str]]:
        with open(yaml_path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)


class Pipeline:
    def __init__(self, root_dir: Path, cred_path: str = "credentials.json"):
        self.root_dir = root_dir
        self.doc_processor = DocumentProcessor()
        self.extractor = KeywordExtractor()
        self.keyword_filter = KeywordFilter()
        self.classifier = KeywordClassifier()
        self.firebase = FirebaseClient(cred_path)
        self.utils = ProjectUtils()

    @property
    def files(self) -> list[Path]:
        all_files = list(self.root_dir.rglob('*.pdf')) + list(self.root_dir.rglob('*.docx'))
        result = []
        for f in all_files:
            if "report" in f.name.lower():
                result.append(f)
        return result

    def run_upload(self) -> None:
        self.firebase.upload(self.files, self.extractor, self.doc_processor, self.keyword_filter)

    def run_export_json(self, output_path: str = "keywords.json") -> None:
        self.utils.save_keywords_json(self.files, self.extractor, self.doc_processor, self.keyword_filter, output_path)

    def run_categorize(self, json_path: str, yaml_path: str) -> dict[str, list[str]]:
        categories = self.utils.load_categories(yaml_path)
        all_keywords: set[str] = {
            kw
            for kws in self.utils.load_json(json_path).values()
            for kw in kws[0]
        }
        return self.classifier.categorize(all_keywords, categories)


def repair_pdf(input_path: Path, output_path: Path) -> None:
        ocrmypdf.ocr(
            input_path,
            output_path,
            force_ocr=True,       # re-OCR even if text layer exists
            language="eng+ces",   # English + Czech
            deskew=True,
        )

def repair_all_pdfs(root_dir: Path) -> None:
    for pdf in root_dir.rglob("*.pdf"):
        tmp = pdf.with_suffix(".tmp.pdf")
        try:
            repair_pdf(pdf, tmp)
            tmp.replace(pdf)
            print(f"Repaired: {pdf.name}")
        except Exception as e:
            tmp.unlink(missing_ok=True)
            print(f"Failed: {pdf.name} — {e}")

def build_hypothesis(cat: str, examples: list[str]) -> str:
    if not examples:
        return f"This text is about {cat}."
    examples_str = ", ".join(examples)
    return f"This text is about {cat}, such as {examples_str}."


def main() -> None:
    # pipeline = Pipeline(
    #     root_dir=Path(r'C:\Users\azhar\Desktop\visualization'),
    #     cred_path="credentials.json",
    # )
    # pipeline.run_export_json()
    # for file in pipeline.files:
    #     text = pipeline.doc_processor.read_text(file)
    #     print(pipeline.extractor.extract_authors_from_file(text))
    # print(pipeline.run_categorize("keywords.json", "tags_test.yaml"))

    firebase = FirebaseClient(cred_path="credentials.json")
    db_data = firebase.fetch_all()
    print(db_data)
    kw1: set[str] = {
            kw
            for entry in db_data.values()
            if isinstance(entry, dict) and "keywords" in entry  # safely skip entries without keywords
            for kw in entry["keywords"]
        }

    utilities = ProjectUtils()
    tags = utilities.load_categories("tags.yaml")
    kw2: set[str] = {
        word
        for examples in tags.values()
        for word in examples
    }
    keywords_not_in_tags: set[str] = kw1 - kw2
    
    classifier = pipeline("zero-shot-classification", model="cross-encoder/nli-deberta-v3-large")
    final_result: dict[str, list[str]] = {cat: list(examples) for cat, examples in tags.items()}
    final_result["UNDEFINED"] = []

    for kw in keywords_not_in_tags:
        scores = {}
        for cat, examples in tags.items():
            hypothesis = f"This text is about {cat}, such as {', '.join(examples)}."
            result = classifier(
                kw,
                candidate_labels=[hypothesis],
                multi_label=False,
                hypothesis_template="{}"
            )
            scores[cat] = result['scores'][0]

        best_cat = max(scores, key=scores.get)
        best_score = scores[best_cat]

        final_result[best_cat if best_score >= 0.6 else "UNDEFINED"].append(kw) 
        print(f"{kw} → {best_cat} (score: {best_score:.2f})")

    with open("categorized_keywords.yaml", "w", encoding="utf-8") as f:
        yaml.dump(final_result, f, allow_unicode=True, default_flow_style=False)

if __name__ == "__main__":
    main()
