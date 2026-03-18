import yaml
import json
import ocrmypdf
from pathlib import Path
from nlp import KeywordFilter, KeywordExtractor
from document import DocumentProcessor

class ProjectUtils:
    @staticmethod
    def save_keywords_json(
        files: list[Path],
        extractor: KeywordExtractor,
        doc_processor: DocumentProcessor,
        keyword_filter: KeywordFilter,
        output_path: str = "keywords.json",
    ) -> None:
        keywords_dict: dict[str, list[str]] = {}
        for file_path in files:
            keywords = extractor.extract_keywords_from_file(file_path, doc_processor)
            folder_id, author, technology = extractor.extract_metadata(file_path)
            if keywords is None:
                print("NONE VALUE TO DATA BASE")
                print(file_path)
                continue
            if keywords == "":
                print("WRONG PDF OR DOCX FILE")
                print(file_path)
                continue 
            keywords = keyword_filter.filter(keywords)
            if folder_id is not None:
                keywords_dict[folder_id] = keywords, author or []
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(keywords_dict, f, ensure_ascii=False, indent=2)

    @staticmethod
    def load_json(file_path: str) -> dict:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    @staticmethod
    def load_categories(yaml_path: str) -> dict[str, list[str]]:
        with open(yaml_path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    
    @staticmethod
    def repair_pdf(input_path: Path, output_path: Path) -> None:
        ocrmypdf.ocr(
            input_path,
            output_path,
            force_ocr=True,       # re-OCR even if text layer exists
            language="eng+ces",   # English + Czech
            deskew=True,
        )

    def repair_all_pdfs(self, root_dir: Path) -> None:
        for pdf in root_dir.rglob("*.pdf"):
            tmp = pdf.with_suffix(".tmp.pdf")
            try:
                self.repair_pdf(pdf, tmp)
                tmp.replace(pdf)
                print(f"Repaired: {pdf.name}")
            except Exception as e:
                tmp.unlink(missing_ok=True)
                print(f"Failed: {pdf.name} — {e}")
    
    @staticmethod
    def save_categories_yaml(data: dict, output_path: str = "categorized_keywords.yaml") -> None:
        with open(output_path, "w", encoding="utf-8") as f:
            yaml.dump(data, f, allow_unicode=True, default_flow_style=False)

