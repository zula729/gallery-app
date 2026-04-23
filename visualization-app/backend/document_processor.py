import pdfplumber
import docx
from pathlib import Path

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

    def _read_docx(self, path: Path) -> str:
        doc = docx.Document(path)
        return "".join(para.text for para in doc.paragraphs)
