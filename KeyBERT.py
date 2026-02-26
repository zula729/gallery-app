from keybert import KeyBERT # type: ignore
from pathlib import Path
import fitz  # type: ignore
import docx
import json
import firebase_admin # type: ignore
from firebase_admin import credentials, db  # type: ignore
from sklearn.feature_extraction.text import CountVectorizer, ENGLISH_STOP_WORDS # type: ignore
import re
from wordfreq import zipf_frequency # type: ignore
import yaml
from transformers import pipeline

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')


model = KeyBERT('distilbert-base-nli-mean-tokens')
root_dir = Path(r'C:\Users\azhar\Desktop\visualization')
all_words: list[str] = []
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")


def docx_reader(file_path: str) -> str:
    doc = docx.Document(file_path)
    text = ""
    for para in doc.paragraphs:
        text += para.text
    return text


def pdf_readred(file_path: Path) -> str:
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text


def init_firebase() -> None:
    if not firebase_admin._apps:
        cred = credentials.Certificate("credentials.json")
        firebase_admin.initialize_app(cred, {
            "databaseURL": "https://visualization-88a6b-default-rtdb.europe-west1.firebasedatabase.app/"
        })
    return


def extract_text(file_path: Path) -> str:
    if file_path.suffix.lower() == '.pdf':
        return pdf_readred(file_path)
    elif file_path.suffix.lower() == '.docx':
        return docx_reader(file_path)
    return ""


def is_real_word(word: str) -> bool:
    return zipf_frequency(word, "en") > 2.5 or zipf_frequency(word, "cs") > 2.5 


def remove_garbage_and_numeric_keywords(keywords):
    clean = []
    for kw in keywords:
        if not re.search(r"\d", kw):
            if " " in kw:
                clean.append(kw)
            else:
                if is_real_word(kw):
                    clean.append(kw)
    return clean


def data_to_database(files: list[Path], ref) -> None:
    for file_path in files:
        keywords, folder_id = extract_keywords(file_path)
        if keywords is None:
            print(file_path)
            print("NONE VALUE TO DATA BASE")
            continue
        db_key = f"{folder_id}"
        ref.child(db_key).set({
            "keywords": keywords,
            "semester": get_semester(file_path),
        })
    return


def get_semester(path: Path) -> str | None:
    for part in path.parts:
        if part.lower().startswith("podzim"):
            return part
    return None


def create_json(files: list[Path]) -> None:
    keywords_dict: dict[str, list[str]] = {}
    for file_path in files:
        keywords, folder_id = extract_keywords(file_path)
        keywords_dict[folder_id] = keywords
    with open("keywords.json", "w", encoding="utf-8") as f:
        json.dump(keywords_dict, f, ensure_ascii=False, indent=2) 
    return


def is_macos_artifact(path: Path) -> bool:
    for part in path.parts:
        p = part.lower()
        if p.startswith("__macosx") or p.startswith("._") or p == ".ds_store":
            return True
    return False


def extract_keywords(file_path: Path) -> tuple[list[str], str] | tuple[None, None]:
    if is_macos_artifact(file_path):
        return None, None
    
    vectorizer = CountVectorizer(
        token_pattern=r"(?u)\b[^\W\d_]{2,}\b" # only words without numbers
    )
    folder_id = None
    try:
        for part in file_path.parts:
            if part[0].isdigit():
                folder_id = part[:6]
                break
        text = extract_text(file_path)

        extracted = extracted = model.extract_keywords(
            text,
            top_n=5,
            vectorizer=vectorizer
        )
        keywords = [kw[0] for kw in extracted]
        # Musim tady udelat lepsi filtr(zatim nevim jake vsechna problema slova budu mit, ale posdle toho budu je tridit)
        # keywords = remove_garbage_and_numeric_keywords(keywords)
        return keywords, folder_id
    except Exception as e:
        print(f"Chyba tady: {file_path.name}: {e}")
    return [], ''


def get_data_from_json(file_path: str) -> dict:
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data


def load_categories(yaml_path: str) -> dict[str, list[str]]:
    with open(yaml_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    return data


def build_candidate_labels(categories: dict[str, list[str]]) -> list[str]:
    labels = []
    for cat, words in categories.items():
        if words:
            words_str = [str(w) for w in words] 
            label = f"{cat}: {', '.join(words_str)}"
        else:
            label = cat
        labels.append(label)
    return labels


def classify_word(word: str, categories: dict[str, list[str]]) -> str:
    candidate_labels = build_candidate_labels(categories)
    result = classifier(
        word,
        candidate_labels=candidate_labels,
        multi_label=False
    )
    best_label = result["labels"][0]
    best_score = result["scores"][0]

    if best_score >= 0.3:
        category = best_label.split(":")[0]
    else:
        category = "UNDEFINED"
    return category


def categorize_keywords(keywords: list[str], categories: dict[str, list[str]]) -> dict[str, list[str]]:
    categorized = {cat: [] for cat in categories}

    for kw in keywords:
        cat = classify_word(kw, categories)
        categorized.setdefault(cat, []).append(kw)
    return categorized


def check_counts(json_path: str, db_ref_path: str):
    # Считаем ключи в JSON
    with open(json_path, 'r', encoding='utf-8') as f:
        json_data = json.load(f)
        json_count = len(json_data.keys())
    
    # Считаем ключи в Firebase
    ref = db.reference(db_ref_path)
    db_data = ref.get()  # Получаем все данные из ветки
    db_count = len(db_data.keys()) if db_data else 0
    
    print(f"--- Результаты проверки ---")
    print(f"Ключей в JSON: {json_count}")
    print(f"Ключей в Firebase: {db_count}")
    print(f"Разница: {json_count - db_count}")


def extract_authors_from_folder_name(folder_name: str):
    # Паттерн: цифры, потом дефис, потом текст до следующего дефиса или конца
    # Мы ищем то, что идет СРАЗУ после первых цифр и дефиса
    match = re.search(r'^\d+-(.*?)(?:-|$)', folder_name)
    
    if match:
        raw_names = match.group(1) # Получаем "Pekar_Matej-pekar_boril" или "Burlutskyi_Ivan-Burlutskyi-Beranger..."
        
        # Заменяем нижнее подчеркивание на пробел и чистим дефисы
        # Чтобы из "Pekar_Matej" получить "Pekar Matej"
        clean_names = raw_names.replace('_', ' ').replace('-', ', ')
        return clean_names
    return "Unknown Author"


def main() -> None:
    init_firebase()
    ref = db.reference('Keywords from projects')
    # files = list(root_dir.rglob('*.pdf')) + list(root_dir.rglob('*.docx'))
    # create_json(files)
    # data_to_database(files, ref)
    # check_counts("keywords.json", 'Keywords from projects')

    #categories = load_categories("tags.yaml")
    # keywords = 
    # for value in get_data_from_json("keywords.json").values():
    #     for val in value:
    #         keywords.append(val)
    # result = categorize_keywords(keywords, categories)
    # print(result)

    folders = [
        "525077-Pekar_Matej-pekar_boril",
        "525221-Lodnanova_Michaela-project",
        "532094-Burlutskyi_Ivan-Burlutskyi-Beranger-SelimcanBicer"
    ]
    for f in folders:
        print(f"Folder: {f} -> Author: {extract_authors_from_folder_name(f)}")
    return

if __name__ == "__main__":
    main()
