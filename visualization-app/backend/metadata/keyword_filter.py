import re
from wordfreq import zipf_frequency


class KeywordFilter:
    """
    Filters extracted keywords based on predefined rules.

    Rules:
    - Reject keywords containing digits
    - Reject keywords that are not common words in English or Czech
    """
    def filter(self, keywords: set[str]) -> list[str]:
        return [kw for kw in keywords if self._is_valid(kw)]

    def _is_valid(self, kw: str) -> bool:
        if re.search(r"\d", kw):          # reject anything with digits
            return False
        return self._is_real_word(kw)

    def _is_real_word(self, word: str) -> bool:
        return (zipf_frequency(word, "en") > 2.5 or
                zipf_frequency(word, "cs") > 2.5)
