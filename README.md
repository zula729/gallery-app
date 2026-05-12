# Bachelor

## Deploy app

```
npm run dev
```

## Add new projects

- Create a folder for each semester using the format: podzim2026, podzim2027, etc.
- Add all project files to the corresponding semester folder.

## Add new categories or technologies

\* Manual adding

- Add new categories to _tags.yaml_ in _../backend/data/_
  - Include all relevant keywords for each category

- Add new technologies to _tech_terms.yaml_ in _../backend/data/_
  - Include all variations of how the technology may appear in text

\*Automatic adding(need to be checked)

- This feature may need refactoring and might not fully support the new format.

## Add projects to database

1. In your main file, initialize the path and pipeline:

```
    path = Path(r"C:\Users\azhar\Desktop\no_keywords")
    pipeline = Pipeline(
        root_dir=Path(path),
    )
```

2. Run the upload process:

```
    pipeline.run_upload()
```

This will automatically extract information from reports and upload it to the database in the correct format.
If something is missing, check the logs for details.

---

## Installation

```
pip install -r requirements.txt
```

## Authors and acknowledgment

### need to be added

## License

### need to be added
