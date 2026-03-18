import sys
import io
from pathlib import Path
from pipeline import Pipeline

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')


def main() -> None:
    pipeline = Pipeline(
        root_dir=Path(r'C:\Users\azhar\Desktop\visualization'),
        cred_path="credentials.json",
    )
    file_path = r"C:\Users\azhar\Desktop\visualization\podzim2024\492632-Cahova_Tereza-pv251proj\final\Semestral Project Report.pdf"
    section = pipeline.doc_processor.extract_section(
        file_path,
        start="Used Technologies",
        end="Lessons Learned"
    )
    print(section)


if __name__ == "__main__":
    main()
