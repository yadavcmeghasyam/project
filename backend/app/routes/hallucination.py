from fastapi import APIRouter
from app.models.schemas import HallucinationRequest, HallucinationResponse
from app.services.hallucination_engine import analyze_claims_against_reference

router = APIRouter(tags=["Hallucination Analyzer"])

@router.post("/analyze-hallucination", response_model=HallucinationResponse)
async def analyze_hallucination(req: HallucinationRequest):
    claims = analyze_claims_against_reference(req.ai_answer, req.reference_text)
    total = len(claims)

    if total == 0:
        return HallucinationResponse(
            overall_hallucination_rate=0.0,
            total_claims=0,
            supported_count=0,
            partially_supported_count=0,
            unsupported_count=0,
            contradicted_count=0,
            claims=[],
            hallucination_summary="No claims detected to evaluate.",
            risk_verdict="Unknown"
        )

    supp = sum(1 for c in claims if c.status == "Supported")
    part = sum(1 for c in claims if c.status == "Partially Supported")
    unsupp = sum(1 for c in claims if c.status == "Unsupported")
    contra = sum(1 for c in claims if c.status == "Contradicted")

    # Hallucination rate = proportion of claims ungrounded or contradicted
    hallucination_rate = round(((unsupp + contra + (part * 0.4)) / total) * 100.0, 1)

    if contra > 0:
        verdict = "Severe Hallucination Risk (Contradictions Present)"
        summary = f"Detected {contra} direct factual contradiction(s) and {unsupp} unsupported claim(s). High potential to mislead users."
    elif unsupp > (total / 2):
        verdict = "High Hallucination Risk"
        summary = f"Over half the response ({unsupp}/{total} claims) lacks grounding in the provided reference document."
    elif unsupp > 0 or part > 0:
        verdict = "Moderate Hallucination Risk"
        summary = f"The response is mostly grounded but contains {unsupp} unverified claim(s) and {part} partially supported detail(s)."
    else:
        verdict = "Low Hallucination Risk (Grounded)"
        summary = "All extracted claims are solidly corroborated by the reference document."

    return HallucinationResponse(
        overall_hallucination_rate=hallucination_rate,
        total_claims=total,
        supported_count=supp,
        partially_supported_count=part,
        unsupported_count=unsupp,
        contradicted_count=contra,
        claims=claims,
        hallucination_summary=summary,
        risk_verdict=verdict
    )

