# Bachelor Thesis

## Description

A showcase of student visualization projects created during the [PV251 Visualization](https://is.muni.cz/predmet/fi/podzim2026/PV251) course at Masaryk University.

Browse projects, explore the technologies used, and discover what students have accomplished each semester. The platform provides project descriptions and data-driven visualizations of topics, semesters, and technology usage across projects.

---

## Architecture

### Backend

The backend is responsible for:

- Collecting projects from a structured folder hierarchy
- Extracting metadata, keywords, and images from project reports (Markdown)
- Processing and classifying data using NLP tools
- Uploading structured data to Firebase Realtime Database and Firebase Storage

### Frontend

The frontend is built with TypeScript, React, and Vite. It consists of the following pages:

- Home – introductory landing page of the application
- Gallery – overview of all projects with search and filtering by keywords, tags, categories, authors, and project names
- Visualization – statistical charts representing the distribution of projects by technology and category

### Important

> **The frontend does not process data itself.**
>
> All project data must be prepared and uploaded through the backend pipeline.

---

## Adding New Projects

1. Create a folder for the semester using the format:

```text
podzim2026
podzim2027
```

2. Add all project files to the corresponding semester folder.

---

## Work with PDF and .docx files

###

---

## Adding Categories and Technologies

### Manual Configuration

#### Categories

Edit:

```text
backend/data/tags.yaml
```

- Add new categories
- Include all relevant keywords for each category

#### Technologies

Edit:

```text
backend/data/tech_terms.yaml
```

- Add new technologies
- Include common variations and aliases that may appear in reports

### Automatic Detection

> This feature may require refactoring and might not fully support the current project format.

---

## Work with new template .md files

###

---

## Uploading Projects to the Database

### 1. Initialize the Pipeline

```python
from pathlib import Path

path = Path(r"C:\example\path")

pipeline = Pipeline(
    root_dir=path,
)
```

### 2. Run the Upload Process

```python
pipeline.run_upload()
```

The pipeline will:

- Extract information from project reports
- Process metadata and classifications
- Upload data to Firebase in the required format

If any data is missing or incorrect, check the application logs for details.

---

## Installation

```bash
pip install -r requirements.txt
```

---

## Tech Stack

### Core

- React 19
- TypeScript
- Vite

### UI & Styling

- Tailwind CSS v4
- Motion (Framer Motion)
- Lucide React

### Data Visualization

- Recharts
- React Markdown

### Backend & Infrastructure

- Firebase
- React Router 7

---
