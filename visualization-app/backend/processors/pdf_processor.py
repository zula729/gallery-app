import shutil
from pathlib import Path
import subprocess
import fitz
import os
import logging

from utils import PathParser
logger = logging.getLogger(__name__)

main_project_path= Path('')
target_dir = Path('')


def files(path) -> list[Path]:
    """
    Finds all PDF and DOCX files in a directory that contain 'report' in their name.

    Performs a case-insensitive recursive lookup matching specific internal file criteria.

    Args:
        path (Path): The root directory to start searching from.

    Returns:
        list[Path]: A list of path objects matching the search filters.
    """
    all_files = list(path.rglob('*.pdf')) + list(path.rglob('*.docx'))
    result = []
    for f in all_files:
        if "report" in f.name.lower():
            result.append(f)
    return result

def rename(root_dir: Path, prefix: str) -> None:
    """
    Prepends a custom string prefix to all PDF report files within a directory tree.

    Args:
        root_dir (Path): Root directory containing target PDFs.
        prefix (str): String value to prepend to the matching filenames.

    Returns:
        None
    """
    for pdf in root_dir.rglob("*.pdf"):
        if "report" in pdf.name.lower():
            new_path = pdf.with_name(f"{prefix}_{pdf.name}")
            pdf.rename(new_path)
            print(f"Renamed: {pdf.name} -> {new_path.name}")\

def no_report_name(source_dir: Path) -> None:
    """
    Scans a folder and prints the locations of PDFs that do not contain the term 'report'.

    Helpful for identifying non-conforming filenames within raw document folders.

    Args:
        source_dir (Path): The folder hierarchy to analyze.

    Returns:
        None
    """
    for pdf in source_dir.rglob("*.pdf"):
        if not "report" in pdf.name.lower():
            print(f"Found: {pdf.name}, {pdf.parent}\n")


def convert_pdf_to_svg(source_dir: Path) -> None:
    """
    Splits multi-page PDFs into standalone SVG pages using Inkscape vector rendering.

    Extracts individual PDF pages locally, saves them out to transient documents, 
    and pipes them into Inkscape. Deletes pages if no raster image layouts are rendered.

    Args:
        source_dir (Path): Folder containing target PDFs for decomposition.

    Returns:
        None
    """
    for pdf in source_dir.rglob("*.pdf"):
        if PathParser.is_macos_artifact(pdf):
            continue
        if "repaired" in pdf.name.lower():
            print(f"Skipped: {pdf.name}")
            continue
        output_folder = pdf.parent / "svg_pages" 
        output_folder.mkdir(parents=True, exist_ok=True)
        # If executing on cross-platform setups, dynamically fetch or configure this variable
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
                os.remove(svg_path)
                logger.info(f"Dropped empty page canvas vector markup template: {svg_name}")

            if temp_pdf.exists():
                os.remove(temp_pdf)
            
        doc.close()


def main():
    path = Path()
    convert_pdf_to_svg(path)

if __name__ == "__main__":
    main()