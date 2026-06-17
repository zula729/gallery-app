from sentence_transformers import SentenceTransformer, util

from firebase import FirebasePushPDF
from utils import JsonYamlManager


class KeywordClassifier:
    def __init__(self, score_threshold: float = 0.4):
        self.model = SentenceTransformer('all-mpnet-base-v2')
        self.score_threshold = score_threshold

    def run_categorize(self, yaml_path: str, firebase: FirebasePushPDF) -> None:
        db_keywords = self._extract_firebase_keywords(firebase)
        tags = JsonYamlManager.load_yaml(yaml_path)
        tag_keywords = self._extract_tag_keywords(tags)
        undefined_keywords = db_keywords - tag_keywords
        result_clean = self._classify_keywords(undefined_keywords, tags)
        JsonYamlManager.save_yaml(result_clean)

    def _extract_firebase_keywords(self, firebase: FirebasePushPDF) -> set[str]:
        keywords = set()
        db_data = firebase.fetch_all()
        for _, data in db_data.items():
            kw_list = data.get('keywords')
            keywords.update(kw_list)
        return keywords

    def _extract_tag_keywords(self, tags: dict) -> set[str]:
        keywords = set()
        for _, data in tags.items():
            if isinstance(data, list):
                keywords.update(data)
        return keywords

    def _classify_keywords(self, keywords: set[str], tags: dict) -> dict:
        import copy
        result = copy.deepcopy(tags)
        if "UNDEFINED" not in result:
            result["UNDEFINED"] = []

        kw_embeddings = self.model.encode(keywords, convert_to_tensor=True)

        for idx, keyword in enumerate(keywords):
            best_score = -1.0
            best_category = "UNDEFINED"

            for category, known_words in tags.items():
                if not known_words:
                    continue
                
                known_embeddings = self.model.encode(known_words, convert_to_tensor=True)
                
                cos_scores = util.cos_sim(kw_embeddings[idx], known_embeddings)[0]
                max_score = float(cos_scores.max())

                if max_score > best_score:
                    best_score = max_score
                    best_category = category

            if best_score >= self.score_threshold:
                result[best_category].append(keyword)
                print(f"{keyword} -> {best_category} (score: {best_score:.2f})")
            else:
                result["UNDEFINED"].append(keyword)
                print(f"{keyword} -> UNDEFINED (best score: {best_score:.2f})")

        return result
