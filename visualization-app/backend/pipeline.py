import sys
import io
from pathlib import Path
sys.path.append(str(Path(__file__).parent))
from utils import JsonYamlManager
from processors import DocumentProcessor, ImageExtractor
from metadata import MetadataExtractor, KeywordFilter, KeywordClassifier, MarkdownExtractor
from firebase import FirebasePushPDF, FirebaseClient, FirebasePushMD

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

class Pipeline:
    """
    Main class for processing project files and uploading results.

    Responsibilities:
    - Collect files from directory structure
    - Extract metadata and keywords
    - Upload data (metadata, keywords, images) to Firebase
    """
    def __init__(self, root_dir: Path):
        """
        Initialize pipeline with required services and processors.

        Args:
            root_dir (Path): Root directory containing all project folders
        """
        self.root_dir = root_dir
        self.doc_processor = DocumentProcessor()
        self.keyword_filter = KeywordFilter()
        self.firebase_client = FirebaseClient()
        #FirebasePushPDF is currently not used, as we are focusing on Markdown-based processing.
        # self.firebase_pusher_pdf = FirebasePushPDF()
        self.firebase_pusher_md = FirebasePushMD()
        self.utils = JsonYamlManager()
        self.image_extractor = ImageExtractor()
        self._pdf_extractor = None
        self._md_extractor = None 
        self._classifier = None
    
    @property
    def pdf_extractor(self) -> MetadataExtractor:
        """
        Lazy initialization of PDF metadata extractor.

        Returns:
            MetadataExtractor: PDF metadata extractor instance
        """
        if self._pdf_extractor is None:
            self._pdf_extractor = MetadataExtractor()
        return self._pdf_extractor
    
    @property
    def md_extractor(self) -> MarkdownExtractor:
        """
        Lazy initialization of Markdown extractor.

        Returns:
            MarkdownExtractor: Markdown processing instance
        """
        if self._md_extractor is None:
            self._md_extractor = MarkdownExtractor()
        return self._md_extractor

    @property
    def classifier(self) -> KeywordClassifier:
        """
        Lazy initialization of keyword classifier.

        Returns:
            KeywordClassifier: Classification model instance
        """
        if self._classifier is None:
            self._classifier = KeywordClassifier()
        return self._classifier

    @property
    def files(self) -> list[Path]:
        return list(self.root_dir.rglob('report.md'))
    
    @property
    def svg_files(self) -> list[Path]:
        all_files = list(self.root_dir.rglob('*.svg'))
        return [f for f in all_files if f.is_file()]
    
    @property
    def images(self) -> list[Path]:
        paths = []
        for ext in ('*.png', '*.jpg', '*.jpeg'):
            paths += [p for p in self.root_dir.rglob(ext) if p.parent.name == 'images']
        return paths

    def run_upload(self) -> None:
        """
        Executes full upload pipeline:

        1. Upload metadata
        2. Upload keywords
        3. Upload images

        Uses Markdown-based processing.
        """
        self.firebase_pusher_md.push_metadata(self.files)
        self.firebase_pusher_md.push_keywords(self.files)
        self.firebase_pusher_md.push_images(self.images)
