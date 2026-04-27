from pathlib import Path
from pipeline import Pipeline


def main() -> None:
    path = Path(r"C:\Users\azhar\Desktop\visualization")
    pipeline = Pipeline(
        root_dir=Path(path),
        cred_path="credentials.json",
    )
    pipeline.run_upload()

if __name__ == "__main__":
    main()
