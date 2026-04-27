import sys
import io
from pathlib import Path
from json_yaml_manager import JsonYamlManager
from document_processor import DocumentProcessor
from keyword_extractor import KeywordExtractor
from keyword_filter import KeywordFilter
from firebase_client import FirebaseClient
from keyword_classifier import KeywordClassifier
from image_extractor import ImageExtractor

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')


class Pipeline:
    def __init__(self, root_dir: Path, cred_path: str = "credentials.json"):
        self.root_dir = root_dir
        self.doc_processor = DocumentProcessor()
        self.keyword_filter = KeywordFilter()
        self.firebase = FirebaseClient(cred_path)
        self.utils = JsonYamlManager()
        self.image_extractor = ImageExtractor()
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
        all_files = list(self.root_dir.rglob('*pdf')) + list(self.root_dir.rglob('*docx'))
        result = []
    
        for f in all_files:
            name = f.name.lower()
            if f.is_file() and "report" in name and "repaired" not in name:
                result.append(f)
        
        return result
    
    @property
    def svg_files(self) -> list[Path]:
        all_files = list(self.root_dir.rglob('*.svg'))
        return [f for f in all_files if f.is_file()]
    
    @property
    def images(self) -> list[Path]:
        pathes = list(self.root_dir.rglob('*.png')) + list(self.root_dir.rglob('*.jpg')) + list(self.root_dir.rglob('*.jpeg'))
        return pathes

    def run_upload(self) -> None:
        # self.firebase.upload_metadata(self.files, self.extractor, self.doc_processor)
        # self.firebase.upload_keywords(self.files, self.extractor, self.doc_processor, self.keyword_filter)
        # self.firebase.upload_images(self.images)
        self.firebase.upload_text(self.files, self.doc_processor)

