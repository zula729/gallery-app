import shutil
from pathlib import Path
import subprocess
import fitz
import os

import ocrmypdf

from utils import PathParser

main_project_path= Path('C:\\Users\\azhar\\Desktop\\visualization')
target_dir = Path('C:\\Users\\azhar\\Desktop\\project_not_in_dataset')


def files(path) -> list[Path]:
    all_files = list(path.rglob('*.pdf')) + list(path.rglob('*.docx'))
    result = []
    for f in all_files:
        if "report" in f.name.lower():
            result.append(f)
    return result

def rename(root_dir: Path, prefix: str) -> None:
    for pdf in root_dir.rglob("*.pdf"):
        if "report" in pdf.name.lower():
            new_path = pdf.with_name(f"{prefix}_{pdf.name}")
            pdf.rename(new_path)
            print(f"Renamed: {pdf.name} -> {new_path.name}")\

def no_report_name(source_dir: Path) -> None:
    for pdf in source_dir.rglob("*.pdf"):
        if not "report" in pdf.name.lower():
            print(f"Found: {pdf.name}, {pdf.parent}\n")


def folder_name(pdf: Path) -> str:
    relative_path = pdf.relative_to(reports_path)
    return relative_path.parent


def move_files(source_dir: Path, target_dir: Path) -> None:
    for pdf in source_dir.rglob("*.pdf"):
        if PathParser.is_macos_artifact(pdf):
            continue
        if "report" in pdf.name.lower():
            folder = folder_name(pdf)
            target_folder = target_dir / folder
            if target_folder.exists() and target_folder.is_dir():
                try:
                    shutil.move(str(pdf), str(target_folder / pdf.name))
                    print(f"Moved: {pdf.name} to {target_folder}")
                except Exception as e:
                    print(f"Error moving {pdf.name}: {e}")
            else:
                print(f"Skip: Target folder {target_folder} does not exist. Not moving.")

def convert_pdf_to_svg(source_dir: Path) -> None:
    for pdf in source_dir.rglob("*.pdf"):
        if PathParser.is_macos_artifact(pdf):
            continue
        if "repaired" in pdf.name.lower():
            print(f"Skipped: {pdf.name}")
            continue
        output_folder = pdf.parent / "svg_pages" 
        output_folder.mkdir(parents=True, exist_ok=True)
        
        inkscape_path = r"C:\Program Files\Inkscape\bin\inkscape.exe"
        
        doc = fitz.open(pdf)
        
        for page_index in range(len(doc)):
            page_num = page_index + 1
            
            temp_pdf = output_folder / f"temp_page_{page_num}.pdf"
            new_doc = fitz.open() 
            new_doc.insert_pdf(doc, from_page=page_index, to_page=page_index)
            new_doc.save(str(temp_pdf))
            new_doc.close()
            
            svg_name = f"{pdf.stem}_page_{page_num}.svg"
            svg_path = output_folder / svg_name
            
            subprocess.run([
                inkscape_path,
                str(temp_pdf),
                "--export-type=svg",
                f"--export-filename={str(svg_path)}"
            ], check=True, capture_output=True)

            with open(svg_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if '<image' not in content:
                    f.close()
                    os.remove(svg_path)
            os.remove(temp_pdf)
            
        doc.close()

def repair_pdf(input_path: Path, output_path: Path) -> None:
    ocrmypdf.ocr(
        input_path,
        output_path,
        force_ocr=True,
        language="eng+ces",
        deskew=True,
    )

def repair_all_pdfs(self, root_dir: Path) -> None:
    for pdf in root_dir.rglob("*.pdf"):
        tmp = pdf.with_suffix(".tmp.pdf")
        try:
            self.repair_pdf(pdf, tmp)
            tmp.replace(pdf)
        except Exception as e:
            tmp.unlink(missing_ok=True)
            print(f"Failed: {pdf.name} — {e}")


# def main():
#     path = Path()
#     convert_pdf_to_svg(path)

# if __name__ == "__main__":
#     main()