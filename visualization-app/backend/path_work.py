from pathlib import Path
import re

class PathParser:
    @staticmethod
    def _get_semester(path: Path) -> str | None:
        for part in path.parts:
            if part.lower().startswith("podzim"):
                return part
        return None

    @staticmethod
    def extract_authors_from_name(path: Path) -> str:
        for part in path.parts:
            if part[0].isdecimal():
                match = re.search(r'^\d+-(.*?)(?:-|$)', part)
                if match:
                    return match.group(1).replace('_', ' ').replace('-', ', ')
        return "Unknown Author"

    @staticmethod
    def is_macos_artifact(path: Path) -> bool:
        for part in path.parts:
            p = part.lower()
            if p.startswith("__macosx") or p.startswith("._") or p == ".ds_store" or p == "__MACOSX":
                return True
        return False

    @staticmethod
    def folder_id_from_path(path: Path) -> str:
        for part in path.parts:
            if part[0].isdecimal():
                return part[:6]
        return "Unknown ID"