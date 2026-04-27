
import firebase_admin
from firebase_admin import credentials, db, storage
from pathlib import Path

from typing import Any
from path_work import PathParser
from json_yaml_manager import JsonYamlManager


class FirebaseClient:
    DB_URL = "https://visualization-88a6b-default-rtdb.europe-west1.firebasedatabase.app/"
    REF_PATH = "Keywords from projects"
    BUCKET_NAME = "visualization-88a6b.firebasestorage.app"

    def __init__(self, cred_path: str = "credentials.json"):
        if not firebase_admin._apps:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, {"databaseURL": self.DB_URL, "storageBucket": self.BUCKET_NAME})
        self.ref = db.reference(self.REF_PATH)

    def _update_data(self, folder_id: str, data: dict[str, list[str]]) -> None:
        current = self.ref.child(folder_id).get() or {}
        merged_data = {}
        for key, values in data.items():
            existing = current.get(key, [])
            if isinstance(existing, list) and isinstance(values, list):
                merged_data[key] = list(set(existing + values))
            else:
                merged_data[key] = values
        self.ref.child(folder_id).update(merged_data)

    def _validate_keywords(self, keywords: Any, file_path: Path) -> bool:
        if keywords is None or keywords == "":
            print(f"NONE VALUE TO DATA BASE: {file_path}")
            return False
        return True
    
    def upload_text(self, files: list[Path], doc_processor):
        for file_path in files:
            if PathParser.is_macos_artifact(file_path):
                continue
            text = doc_processor.read_text(file_path)
            folder_id = PathParser.folder_id_from_path(file_path)
            if text is None or text == "":
                print(f"NONE VALUE TO DATA BASE: {file_path}")
                continue
            print(f"(folder_id: {folder_id})")
            self._update_data(folder_id, {"text": text})

    def upload_metadata(self, files: list[Path], extractor, doc_processor):
        for file_path in files:
            if PathParser.is_macos_artifact(file_path):
                continue
            data_to_send = extractor.extract_metadata(file_path, doc_processor)
            folder_id = PathParser.folder_id_from_path(file_path)
            if not folder_id:
                print(f"Error: {file_path}")
                continue
            self._update_data(folder_id, data_to_send)

    def upload_keywords(self, files: list[Path], extractor, doc_processor,keyword_filter):
        for file_path in files:
            if PathParser.is_macos_artifact(file_path):
                continue
            keywords = (extractor.extract_keywords_from_file(file_path, doc_processor))
            
            folder_id = PathParser.folder_id_from_path(file_path)
            if keywords is None or keywords == "":
                print(f"NONE VALUE TO DATA BASE: {file_path}")
                continue
            self._update_data(folder_id, keywords)

    def upload_keywords_from_json(self, json_path: str):
        data = JsonYamlManager.load_json(json_path)
        for folder_id, keywords in data.items():
            self._update_data(folder_id, {"keywords": keywords})
    
    def upload_images(self, files: list[Path]):
        bucket = storage.bucket()
        urls_by_folder: dict[str, list[str]] = {}

        for file_path in files:
            try: 
                folder_id = PathParser.folder_id_from_path(file_path)
                blob = bucket.blob(f"{folder_id}/images/{file_path.name}")
                blob.upload_from_filename(str(file_path))
                blob.make_public()

                urls_by_folder.setdefault(folder_id, []).append(blob.public_url)
            except Exception as e:
                print(f"Error uploading {file_path.name}: {e}")

        for folder_id, urls in urls_by_folder.items():
            try:
                self._update_data(folder_id, {"images": urls})
            except Exception as e:
                print(f"Error updating database for {folder_id}: {e}")

    def fetch_all(self) -> dict:
        return self.ref.get() or {}

    def delete_empty_keywords(self) -> None:
        data = self.fetch_all()
        for folder_id, entry in data.items():
            if not entry.get("keywords"):
                self.ref.child(folder_id).delete()
                print(f"Deleted: {folder_id}")

    def clean_keywords_by_yaml(self, yaml_path: str, dry_run: bool = True) -> int:
        categories = JsonYamlManager.load_categories(yaml_path)
        allowed: set[str] = self._extract_all_allowed_keywords(categories)

        db_data = self.fetch_all()
        total_removed = 0

        for folder_id, entry in db_data.items():
            removed = self._clean_entry_keywords(folder_id, entry, allowed, dry_run)
            total_removed += removed

        return total_removed
    
    def _extract_all_allowed_keywords(self, categories: dict) -> set[str]:
        allowed = set()
        for examples in categories.values():
            allowed.update(self._ensure_list(examples))
        return allowed

    def _clean_entry_keywords(
        self,
        folder_id: str,
        entry: dict,
        allowed: set[str],
        dry_run: bool
    ) -> int:
        kw_list = entry.get("keywords", [])
        if not kw_list:
            return 0

        to_remove = [kw for kw in kw_list if kw not in allowed]
        if not to_remove:
            return 0
 
        if not dry_run:
            cleaned = [kw for kw in kw_list if kw in allowed]
            self._update_data(folder_id, {"keywords": cleaned})
 
        return len(to_remove)

    def find_missing_from_db(self, root_dir: Path):
        local_ids = self._scan_local_structure(root_dir)
        db_ids = set(self.fetch_all().keys())

        missing = {fid: name for fid, name in local_ids.items() if fid not in db_ids}

        print(f"dirs: {len(local_ids)}")
        print(f"firebase:  {len(db_ids)}")
        if missing:
            print(f"not in database ({len(missing)}):")
            for fid, name in sorted(missing.items()):
                print(f"{fid}->{name}")
        self._print_missing_report(local_ids, db_ids, missing)
        return missing

    def _print_missing_report(
        self, 
        local_ids: dict, 
        db_ids: set, 
        missing: dict
    ) -> None:
        print(f"dirs: {len(local_ids)}")
        print(f"firebase:  {len(db_ids)}")
        if missing:
            print(f"not in database ({len(missing)}):")
            for fid, name in sorted(missing.items()):
                print(f"{fid}->{name}")

    def _scan_local_structure(self, root_dir: Path) -> dict[str, str]:
        local_ids = {}
        for semester in root_dir.iterdir():
            for folder in semester.iterdir():
                folder_id = folder.name[:6]
                local_ids[folder_id] = folder.name
        return local_ids

    def find_missing_text_in_db(self):
        data = self.fetch_all()
        missing_text = {fid: entry for fid, entry in data.items() if not entry.get("text")}
        print(f"Total entries: {len(data)}")
        print(f"Entries missing text: {len(missing_text)}")
        for fid, entry in missing_text.items():
            print(f"{fid}: {entry.get('name', 'Unknown')}")

