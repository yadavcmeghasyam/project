import re
from typing import List

# Common non-factual pleasantries and meta-commentary to exclude
FILLER_PATTERNS = [
    r"^here is (the|an|your) ",
    r"^sure,?\s*(here|i can|i have)?",
    r"^certainly,?\s*",
    r"^i hope this helps",
    r"^let me know if you have any questions",
    r"^in summary,?\s*$",
    r"^in conclusion,?\s*$",
    r"^as an ai language model",
    r"^according to the document",
]

def clean_sentence(text: str) -> str:
    """Strip bullet symbols, numbering, and whitespace."""
    text = re.sub(r"^[\s\*\-\•\d\.\)\:]+", "", text).strip()
    return text

def extract_claims(ai_answer: str) -> List[str]:
    """
    Splits an AI-generated answer into individual factual claim candidates.
    Splits on sentence delimiters, newlines, and bullet points.
    """
    if not ai_answer or not ai_answer.strip():
        return []

    raw_lines = ai_answer.strip().split("\n")
    candidates = []

    for line in raw_lines:
        line = line.strip()
        if not line:
            continue
        
        # Split on sentence terminals: . ! ? followed by whitespace or end of line
        sentences = re.split(r'(?<=[.!?])\s+', line)
        for s in sentences:
            cleaned = clean_sentence(s)
            # Minimum length check to avoid single words
            if len(cleaned) >= 8:
                candidates.append(cleaned)

    # Filter out conversational filler and greetings
    claims = []
    for c in candidates:
        lower_c = c.lower()
        is_filler = any(re.search(pat, lower_c) for pat in FILLER_PATTERNS)
        if not is_filler:
            claims.append(c)

    # Fallback: if all filtered out, return the original trimmed answer
    if not claims and ai_answer.strip():
        claims = [clean_sentence(ai_answer.strip())]

    return claims
