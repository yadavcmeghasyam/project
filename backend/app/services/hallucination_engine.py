import re
from typing import List, Dict, Any, Tuple
from app.models.schemas import ClaimEvaluation
from app.services.claim_extractor import extract_claims

STOPWORDS = {
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
    "by", "from", "up", "about", "into", "over", "after", "is", "are", "was", "were",
    "be", "been", "being", "have", "has", "had", "do", "does", "did", "this", "that",
    "these", "those", "it", "its", "as", "than", "there"
}

SYNONYMS = {
    "founded": {"established", "created", "built", "started", "formed", "inaugurated"},
    "established": {"founded", "created", "built", "started", "formed"},
    "roughly": {"approximately", "around", "about", "estimated"},
    "approximately": {"roughly", "around", "about", "nearly"},
    "residents": {"population", "inhabitants", "citizens", "people"},
    "population": {"residents", "inhabitants", "citizens"},
    "compound": {"substance", "molecule", "matter"},
    "consisting": {"composed", "made", "containing", "comprising"},
    "made": {"composed", "consisting", "formed"},
    "travels": {"moves", "propagates", "radiates"},
}

ANTONYM_PAIRS = [
    ("faster", "slower"),
    ("increase", "decrease"),
    ("hotter", "colder"),
    ("higher", "lower"),
    ("larger", "smaller"),
    ("more", "less"),
    ("before", "after"),
    ("true", "false"),
    ("always", "never"),
    ("possible", "impossible"),
    ("safe", "dangerous"),
    ("heavy", "light"),
]

def tokenize(text: str) -> List[str]:
    """Tokenize and remove punctuation & stopwords."""
    words = re.findall(r'\b[a-zA-Z0-9\-\_]+\b', text.lower())
    return [w for w in words if w not in STOPWORDS and len(w) > 1]

def extract_numbers(text: str) -> List[str]:
    """Extract numeric values including commas and decimals."""
    return re.findall(r'\b\d+(?:[.,]\d+)?\b', text)

def split_reference_segments(reference: str) -> List[str]:
    """Split reference into sentence-level chunks."""
    raw = re.split(r'(?<=[.!?\n])\s+', reference.strip())
    return [s.strip() for s in raw if len(s.strip()) > 5]

def calculate_grounding_similarity(claim_tokens: List[str], ref_tokens: List[str], claim_text: str, ref_text: str) -> float:
    """
    Computes groundedness similarity between claim and reference segment.
    Uses Claim Coverage (recall) combined with Jaccard overlap and synonym expansion.
    """
    if not claim_tokens or not ref_tokens:
        return 0.0

    ref_set = set(ref_tokens)
    matched_count = 0

    for token in claim_tokens:
        if token in ref_set:
            matched_count += 1
        elif token in SYNONYMS:
            # Check if any synonym is in reference tokens
            if any(syn in ref_set for syn in SYNONYMS[token]):
                matched_count += 1

    # Claim coverage: What fraction of the claim's factual keywords are substantiated by the reference?
    claim_coverage = matched_count / len(claim_tokens)
    
    # Jaccard overlap: Intersection / Union
    jaccard = matched_count / len(set(claim_tokens).union(ref_set))

    # Composite similarity: Weight coverage higher since reference sentences are naturally longer
    composite = (0.75 * claim_coverage) + (0.25 * jaccard)

    # Substring boost
    if claim_text.lower() in ref_text.lower():
        composite = max(composite, 0.95)

    # Numeric match boost
    nums_claim = extract_numbers(claim_text)
    nums_ref = extract_numbers(ref_text)
    if nums_claim and nums_ref:
        if set(nums_claim).intersection(set(nums_ref)):
            composite = min(1.0, composite + 0.15)

    return min(1.0, composite)

def detect_contradiction(claim: str, reference_segment: str) -> Tuple[bool, str]:
    """
    Checks for semantic contradictions such as negation mismatch,
    antonym inversion, or conflicting numeric quantities in the same context.
    """
    claim_lower = claim.lower()
    ref_lower = reference_segment.lower()

    # 1. Check antonym pairs
    for word_a, word_b in ANTONYM_PAIRS:
        if (word_a in claim_lower and word_b in ref_lower) or (word_b in claim_lower and word_a in ref_lower):
            return True, f"Conflicting opposite attributes detected: '{word_a}' vs '{word_b}'."

    # 2. Check negation mismatch
    negations = ["not", "never", "no", "cannot", "neither", "none"]
    claim_has_neg = any(f" {n} " in f" {claim_lower} " for n in negations)
    ref_has_neg = any(f" {n} " in f" {ref_lower} " for n in negations)

    sim = calculate_grounding_similarity(tokenize(claim), tokenize(reference_segment), claim, reference_segment)
    if sim >= 0.40 and (claim_has_neg != ref_has_neg):
        return True, "Polarity contradiction: one statement asserts a condition while the other denies it."

    # 3. Check conflicting numbers in similar context
    nums_claim = extract_numbers(claim)
    nums_ref = extract_numbers(reference_segment)
    if nums_claim and nums_ref and sim >= 0.35:
        if not set(nums_claim).intersection(set(nums_ref)):
            return True, f"Numeric mismatch: claim states '{nums_claim[0]}' while reference mentions '{nums_ref[0]}'."

    return False, ""

def analyze_claims_against_reference(ai_answer: str, reference_text: str) -> List[ClaimEvaluation]:
    """
    Core claim verification engine.
    Extracts individual claims and evaluates each against the reference document.
    """
    extracted_claims = extract_claims(ai_answer)
    if not extracted_claims:
        return []

    ref_segments = split_reference_segments(reference_text)
    if not ref_segments:
        ref_segments = [reference_text.strip()]

    # Also include whole reference as candidate segment for cross-sentence references
    candidate_segments = list(ref_segments)
    if len(ref_segments) > 1:
        candidate_segments.append(reference_text.strip())

    evaluated_claims = []

    for idx, claim in enumerate(extracted_claims, start=1):
        claim_tokens = tokenize(claim)
        
        best_sim = 0.0
        best_segment = ""
        best_contradiction = False
        contradiction_reason = ""

        # Compare claim against each reference segment to find best match
        for seg in candidate_segments:
            seg_tokens = tokenize(seg)
            sim = calculate_grounding_similarity(claim_tokens, seg_tokens, claim, seg)

            is_contra, c_reason = detect_contradiction(claim, seg)

            if is_contra and sim >= 0.25:
                best_contradiction = True
                contradiction_reason = c_reason
                best_segment = seg
                best_sim = sim
                break

            if sim > best_sim:
                best_sim = sim
                best_segment = seg

        # Determine status and reasoning based on claim grounding
        if best_contradiction:
            status = "Contradicted"
            confidence = 0.92
            reasoning = f"Contradiction identified with reference segment: {contradiction_reason}"
        elif best_sim >= 0.45:
            status = "Supported"
            confidence = min(0.99, round(best_sim + 0.1, 2))
            reasoning = "Strong semantic correspondence with ground-truth reference material."
        elif best_sim >= 0.20:
            status = "Partially Supported"
            confidence = round(best_sim + 0.25, 2)
            reasoning = "Moderate overlap found, but specific details, numbers, or phrasing differ from the reference."
        else:
            status = "Unsupported"
            confidence = 0.85
            reasoning = "No corresponding statements or evidence found in the provided reference document."
            best_segment = None

        evaluated_claims.append(
            ClaimEvaluation(
                claim_id=idx,
                claim_text=claim,
                status=status,
                confidence=confidence,
                reasoning=reasoning,
                matched_reference_segment=best_segment,
                similarity_score=round(best_sim, 2)
            )
        )

    return evaluated_claims

def compute_reliability_score(claims: List[ClaimEvaluation]) -> Tuple[float, str, List[str], str]:
    """
    Computes transparent reliability score out of 100 based on weighted claim status.
    Formula:
    Score = (Supported * 100 + Partially * 60 + Unsupported * 20 + Contradicted * 0) / Total Claims
    Deductions: Severe penalty (-25) if any direct contradictions exist.
    """
    if not claims:
        return 50.0, "Warning", ["No factual claims could be extracted."], "Insufficient text for evaluation."

    total = len(claims)
    supp = sum(1 for c in claims if c.status == "Supported")
    part = sum(1 for c in claims if c.status == "Partially Supported")
    unsupp = sum(1 for c in claims if c.status == "Unsupported")
    contra = sum(1 for c in claims if c.status == "Contradicted")

    weighted_points = (supp * 100.0) + (part * 60.0) + (unsupp * 20.0) + (contra * 0.0)
    raw_score = weighted_points / total

    # Additional penalty for contradictions
    if contra > 0:
        raw_score = max(0.0, raw_score - (contra * 25.0))

    final_score = round(max(0.0, min(100.0, raw_score)), 1)

    # Determine risk level
    warnings = []
    if contra > 0:
        warnings.append(f"Detected {contra} direct contradiction(s) against the reference document.")
    if unsupp > 0:
        warnings.append(f"Found {unsupp} claim(s) unsupported by the reference text (possible hallucination).")
    if part > 0 and final_score < 75:
        warnings.append(f"Found {part} claim(s) with only partial grounding.")

    if final_score >= 75.0 and contra == 0:
        risk_level = "Reliable"
        explanation = f"High reliability ({final_score}/100). The majority of claims are fully grounded in the provided reference material."
    elif final_score >= 50.0 and contra == 0:
        risk_level = "Warning"
        explanation = f"Moderate reliability ({final_score}/100). Several claims contain unverified assertions or slight deviations from reference."
    else:
        risk_level = "High Risk"
        explanation = f"High risk detected ({final_score}/100). Contains contradictions or substantial unsupported claims that deviate from reference facts."

    return final_score, risk_level, warnings, explanation
