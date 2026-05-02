from pathlib import Path
import yaml

from utils.paths import TAGS_YAML

class JsonYamlManager:
    @staticmethod
    def save_yaml(data: dict, output_path: str = "categorized_keywords.yaml") -> None:
        with open(output_path, "w", encoding="utf-8") as f:
            yaml.dump(data, f, allow_unicode=True, default_flow_style=False)

    @staticmethod
    def load_yaml() -> dict[str, list[str]]:
        with open(TAGS_YAML, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
