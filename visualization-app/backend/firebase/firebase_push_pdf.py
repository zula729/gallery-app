import firebase_admin
import logging
from firebase_admin import credentials, db, storage
from pathlib import Path

from utils import PathParser

logger = logging.getLogger(__name__)


class FirebasePushPDF:
    """
    Handles uploading project data (metadata, keywords)
    to Firebase Realtime Database.
    """

    DB_URL = "https://visualization-88a6b-default-rtdb.europe-west1.firebasedatabase.app/"
    REF_PATH = "Keywords from projects"
    BUCKET_NAME = "visualization-88a6b.firebasestorage.app"
    DEFAULT_CRED = Path(__file__).parent.parent / "credentials.json"

    def __init__(self, cred_path: Path = DEFAULT_CRED):
        """
        Initializes Firebase app (if not already initialized)
        and creates a reference to the database path.
        """
        if not firebase_admin._apps:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, {"databaseURL": self.DB_URL, "storageBucket": self.BUCKET_NAME})
        self.ref = db.reference(self.REF_PATH)

    def _merge_and_push(self, folder_id: str, data: dict[str, list[str]]) -> None:
        """
        Merges new data with existing Firebase data and updates it.

        - Lists are merged and deduplicated
        - Other values are overwritten

        Args:
            folder_id (str): Unique project identifier
            data (dict): Data to upload
        """
        current = self.ref.child(folder_id).get() or {}
        merged_data = {}
        for key, values in data.items():
            existing = current.get(key, [])
            if isinstance(existing, list) and isinstance(values, list):
                merged_data[key] = list(set(existing + values))
            else:
                merged_data[key] = values
        self.ref.child(folder_id).update(merged_data)

    def push_metadata(self, files: list[Path]):
        """
        Extracts metadata from files and uploads it to Firebase.

        Includes:
        - Project name
        - Authors
        - Technologies
        - Tags
        - Semester

        Args:
            files (list[Path]): List of file paths
        """
        from metadata import MetadataExtractor
        extractor = MetadataExtractor()
        for file_path in files:
            if PathParser.is_macos_artifact(file_path):
                continue
            data_to_send = extractor.extract_metadata(file_path)
            folder_id = PathParser.extract_folder_id(file_path)
            if not folder_id:
                logging.warning(f"Error: {file_path}")
                continue
            self._merge_and_push(folder_id, data_to_send)

    def push_keywords(self, files: list[Path], extractor, doc_processor):
        """
        Extracts keywords from files and uploads them to Firebase.

        Args:
            files (list[Path]): List of file paths
        """
        for file_path in files:
            if PathParser.is_macos_artifact(file_path):
                continue
            text = doc_processor.read_text(file_path).lower()
            keywords = (extractor.extract_keywords(text))
            if keywords is None or keywords == "":
                logging.warning(f"NONE VALUE TO DATA BASE: {file_path}")
                continue
            
            folder_id = PathParser.extract_folder_id(file_path)
            self._merge_and_push(folder_id, keywords)

    def push_images(self, files: list[Path]):
        """
        Uploads image files to Firebase Storage and stores their public URLs
        in the Realtime Database.

        Images are grouped by project folder_id.

        Args:
            files (list[Path]): List of image file paths
        """
        bucket = storage.bucket()
        urls_by_folder: dict[str, list[str]] = {}

        for file_path in files:
            try: 
                folder_id = PathParser.extract_folder_id(file_path)
                blob = bucket.blob(f"{folder_id}/{file_path.name}")
                blob.upload_from_filename(str(file_path))
                blob.make_public()

                urls_by_folder.setdefault(folder_id, []).append(blob.public_url)
            except Exception as e:
                logging.error(f"Error uploading {file_path.name}: {e}")

        for folder_id, urls in urls_by_folder.items():
            try:
                self._merge_and_push(folder_id, {"images": urls})
            except Exception as e:
                logging.error(f"Error updating database for {folder_id}: {e}")
