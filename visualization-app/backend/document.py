import re
import pdfplumber
from pathlib import Path
import docx


class DocumentProcessor:
    def read_text(self, file_path: Path) -> str:
        if file_path.suffix.lower() == '.pdf':
            return self._read_pdf(file_path)
        if file_path.suffix.lower() == '.docx':
            return self._read_docx(file_path)
        return ""

    def _read_pdf(self, path: Path) -> str:
        with pdfplumber.open(path) as pdf:
            return "".join(page.extract_text() or "" for page in pdf.pages)

    def _read_docx(self, path: Path):
        doc = docx.Document(path)
        return "".join(para.text for para in doc.paragraphs)

    def extract_section(self, file_path: Path, start: str, end: str) -> str:
        text = self.read_text(file_path)
        pattern = rf"{re.escape(start)}(.*?){re.escape(end)}"
        match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
        return match.group(1).strip() if match else ""
