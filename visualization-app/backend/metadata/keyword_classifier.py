import logging
from sentence_transformers import SentenceTransformer, util

from firebase import FirebasePushPDF
from utils import JsonYamlManager

logger = logging.getLogger(__name__)


class KeywordClassifier:
    """
    Classifies extracted keywords into predefined categories using semantic similarity.
    Uses a SentenceTransformer model to compute embeddings and cosine similarity.
    """
    def __init__(self, score_threshold: float = 0.4):
        """
        Initializes the classifier with a SentenceTransformer model.

        Args:
            score_threshold (float): Minimum cosine similarity score required 
                                     to assign a keyword to a category. Defaults to 0.4.
        """
        self.model = SentenceTransformer('all-mpnet-base-v2')
        self.score_threshold = score_threshold

    def run_categorize(self, yaml_path: str, firebase: FirebasePushPDF) -> None:
        """
        Categorizes undefined keywords from Firebase into predefined categories.

        Fetches existing data, determines which keywords have not yet been categorized,
        runs semantic analysis, and updates the local YAML configuration.

        Args:
            yaml_path (str): File path to the YAML containing categories.
            firebase (FirebasePushPDF): Instantiated Firebase client wrapper object.

        Returns:
            None
        """
        db_keywords = self._extract_firebase_keywords(firebase)
        tags = JsonYamlManager.load_yaml(yaml_path)
        tag_keywords = self._extract_tag_keywords(tags)
        undefined_keywords = db_keywords - tag_keywords
        result_clean = self._classify_keywords(undefined_keywords, tags)
        JsonYamlManager.save_yaml(result_clean)

    def _extract_firebase_keywords(self, firebase: FirebasePushPDF) -> set[str]:
        """
        Extracts all unique keywords present in the Firebase database records.

        Args:
            firebase (FirebasePushPDF): Instantiated Firebase client wrapper object.

        Returns:
            set[str]: A set of all unique keyword strings found across database records.
        """
        keywords = set()
        db_data = firebase.fetch_all()
        for _, data in db_data.items():
            kw_list = data.get('keywords')
            keywords.update(kw_list)
        return keywords

    def _extract_tag_keywords(self, tags: dict) -> set[str]:
        """
        Extracts all existing keywords already assigned to predefined categories.

        Args:
            tags (dict): Dictionary mapping categories to lists of known keywords.

        Returns:
            set[str]: A set of all keywords that are already categorized.
        """
        keywords = set()
        for _, data in tags.items():
            if isinstance(data, list):
                keywords.update(data)
        return keywords

    def _classify_keywords(self, keywords: set[str], tags: dict) -> dict:
        """
        Classifies new keywords into categories based on semantic similarity.

        Computes cosine similarity between new keyword embeddings and known category 
        keyword embeddings. Maps to the highest scoring category above the threshold.

        Args:
            keywords (set[str]): A set of unclassified keyword strings.
            tags (dict): The original dictionary containing categories and words.

        Returns:
            dict: A deep copy of the original tags dictionary updated with the newly classified words.
        """
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
                logging.info(f"{keyword} -> {best_category} (score: {best_score:.2f})")
            else:
                result["UNDEFINED"].append(keyword)
                logging.info(f"{keyword} -> UNDEFINED (best score: {best_score:.2f})")

        return result
