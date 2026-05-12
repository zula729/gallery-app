from pathlib import Path
import re

class PathParser:
    """
    Utility class for extracting structured information from file paths.

    Assumes a specific folder naming convention, e.g.:
        podzim2026/123456-Author_Name-project/...
    """
    @staticmethod
    def extract_semester(path: Path) -> str | None:
        """
        Extracts the semester name from the path.

        Looks for a folder starting with 'podzim' (case-insensitive).

        Returns:
            str: Semester name (e.g. 'podzim2026')
            None: If no semester folder is found
        """
        for part in path.parts:
            if part.lower().startswith("podzim"):
                return part
        return None

    @staticmethod
    def extract_authors(path: Path) -> str:
        """
        Extracts author name(s) from the folder name.

        Expected format:
            <ID>-<author_name>-<something_else>

        Example:
            '123456-John_Doe-project' -> 'John Doe'

        Rules:
            - Author part is between first '-' and next '-' (or end of string)
            - '_' is replaced with space
            - '-' inside names becomes ', ' (multiple authors)

        Returns:
            str: Formatted author name(s)
            'Unknown Author': If no valid pattern is found
        """
        for part in path.parts:
            if part[0].isdecimal():
                match = re.search(r'^\d+-(.*?)(?:-|$)', part)
                if match:
                    return match.group(1).replace('_', ' ').replace('-', ', ')
        return "Unknown Author"

    @staticmethod
    def is_macos_artifact(path: Path) -> bool:
        """
        Detects macOS-specific system files and folders.

        These files are usually unwanted artifacts from ZIP extraction.

        Checks for:
            - __MACOSX folders
            - ._ prefixed files
            - .DS_Store files

        Returns:
            bool: True if the path contains macOS artifact, otherwise False
        """
        for part in path.parts:
            p = part.lower()
            if p.startswith("__macosx") or p.startswith("._") or p == ".ds_store" or p == "__MACOSX":
                return True
        return False

    @staticmethod
    def extract_folder_id(path: Path) -> str:
        """
        Extracts the project ID from the folder name.

        Expected format:
            Folder starts with numeric ID (e.g. '123456-...')

        Returns:
            str: First 6 characters of the ID
            'Unknown ID': If no valid folder is found
        """
        for part in path.parts:
            if part[0].isdecimal():
                return part[:6]
        return "Unknown ID"