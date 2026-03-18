from firebase_admin import credentials, db
import firebase_admin
from pathlib import Path
from document import DocumentProcessor
from nlp import KeywordFilter, KeywordExtractor


class FirebaseClient:
    DB_URL = "https://visualization-88a6b-default-rtdb.europe-west1.firebasedatabase.app/"
    REF_PATH = "Keywords from projects"

    def __init__(self, cred_path: str = "credentials.json"):
        if not firebase_admin._apps:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, {"databaseURL": self.DB_URL})
        self.ref = db.reference(self.REF_PATH)

    def upload_metadata(self, files: list[Path], extractor: KeywordExtractor):
        for file_path in files:
            folder_id, author, technology = extractor.extract_metadata(file_path)
            self.ref.child(f"{folder_id}").update({
                "semester": self._get_semester(file_path),
                "author": author, 
                "technology": technology, 
            })

    def upload_keywords(self, files: list[Path], extractor: KeywordExtractor, doc_processor: DocumentProcessor, keyword_filer: KeywordFilter):
        for file_path in files:
            keywords = extractor.extract_keywords_from_file(file_path, doc_processor)
            folder_id = extractor.folder_id_from_path(file_path)
            if keywords is None:
                print("NONE VALUE TO DATA BASE")
                print(file_path)
                continue
            if keywords == "":
                print("WRONG PDF OR DOCX FILE")
                print(file_path)
                continue
            keywords = keyword_filer.filter(keywords)
            self.ref.child(f"{folder_id}").update({
                "keywords": keywords,
            })

    @staticmethod
    def _get_semester(path: Path) -> str | None:
        for part in path.parts:
            if part.lower().startswith("podzim"):
                return part
        return None

    def fetch_all(self) -> dict:
        return self.ref.get() or {}

