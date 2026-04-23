from pathlib import Path
from flask import json
import yaml

class JsonYamlManager:
    @staticmethod
    def save_yaml(data: dict, output_path: str = "categorized_keywords.yaml") -> None:
        with open(output_path, "w", encoding="utf-8") as f:
            yaml.dump(data, f, allow_unicode=True, default_flow_style=False)

    @staticmethod
    def load_json(file_path: str) -> dict:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    @staticmethod
    def load_yaml(yaml_path: str) -> dict[str, list[str]]:
        with open(yaml_path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)

    def save_json(
        self,
        files: list[Path],
        extractor,
        output_path: str = "keywords.json",
    ) -> None:
        keywords_dict = {}
        for file_path in files:
            folder_id = extractor.folder_id_from_path(file_path)
            keywords = extractor.extract_keywords_from_file(file_path, extractor.doc_processor)

            keywords_dict[folder_id] = keywords.items().value() if keywords else []
            print(f"✓ {folder_id}: {len(keywords)}")

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(keywords_dict, f, ensure_ascii=False, indent=2)
