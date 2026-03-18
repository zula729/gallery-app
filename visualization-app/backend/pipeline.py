from pathlib import Path
from document import DocumentProcessor
from nlp import KeywordFilter, KeywordExtractor, KeywordClassifier
from db import FirebaseClient
from utils import ProjectUtils

class Pipeline:
    def __init__(self, root_dir: Path, cred_path: str = "credentials.json"):
        self.root_dir = root_dir
        self.doc_processor = DocumentProcessor()
        self.keyword_filter = KeywordFilter()
        self.firebase = FirebaseClient(cred_path)
        self.utils = ProjectUtils()
        self._extractor = None    # lazy
        self._classifier = None   # lazy
    
    @property
    def extractor(self) -> KeywordExtractor:
        if self._extractor is None:
            self._extractor = KeywordExtractor()
        return self._extractor

    @property
    def classifier(self) -> KeywordClassifier:
        if self._classifier is None:
            self._classifier = KeywordClassifier()
        return self._classifier
    
    @property
    def files(self) -> list[Path]:
        all_files = list(self.root_dir.rglob('*.pdf')) + list(self.root_dir.rglob('*.docx'))
        result = []
        for f in all_files:
            if "report" in f.name.lower():
                result.append(f)
        return result

    def run_upload(self) -> None:
        self.firebase.upload_keywords(self.files, self.extractor, self.doc_processor, self.keyword_filter)
        self.firebase.upload_metadata(self.files, self.extractor)

    def run_export_json(self, output_path: str = "keywords.json") -> None:
        self.utils.save_keywords_json(self.files, self.extractor, self.doc_processor, self.keyword_filter, output_path)

    def run_categorize(self, yaml_path: str) -> None:
        db_data = self.firebase.fetch_all()

        kw1 = set()
        for _, data in db_data.items():
            kw_list = data.get('keywords')
            if isinstance(kw_list, list):
                kw1.update(kw_list)

        tags = self.utils.load_categories(yaml_path)

        kw2: set[str] = set()
        for _, data in tags.items():
            if isinstance(data, list):
                kw2.update(data)

        keywords_not_in_tags: set[str] = kw1 - kw2

        final_result: dict[str, list[str]] = {
            cat: list(examples) if examples else []
            for cat, examples in tags.items()
        }
        final_result["UNDEFINED"] = []

        # result without existing examples — only newly classified words
        result_clean: dict[str, list[str]] = {cat: [] for cat in tags}
        result_clean["UNDEFINED"] = []

        # hypotheses se sestaví JEDNOU před hlavním looopem
        hypotheses = [
            f"This text is about {cat}, such as {', '.join(examples if isinstance(examples, list) else [])}."
            for cat, examples in tags.items()
        ]
        cat_names = list(tags.keys())

        for kw in keywords_not_in_tags:
            result = self.classifier.classifier(
                kw,
                candidate_labels=hypotheses,
                multi_label=False,
                hypothesis_template="{}"
            )
            scores = {
                cat_names[hypotheses.index(label)]: score
                for label, score in zip(result['labels'], result['scores'])
            }
            best_cat = max(scores, key=scores.get)
            best_score = scores[best_cat]
            chosen = best_cat if best_score >= 0.6 else "UNDEFINED"
            final_result[chosen].append(kw)
            result_clean[chosen].append(kw)
            print(f"{kw} → {chosen} (score: {best_score:.2f})")

        self.utils.save_categories_yaml(result_clean)
