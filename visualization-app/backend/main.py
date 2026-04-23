from pathlib import Path

from pipeline import Pipeline

def main() -> None:
    pipeline = Pipeline(
        root_dir=Path(r'C:\Users\azhar\Desktop\New folder'),
        cred_path="credentials.json",
    )
    
    # pipeline.image_extractor.extract_images_from_docx(pipeline.root_dir / "report.docx")
    pipeline.run_upload()


if __name__ == "__main__":
    main() 