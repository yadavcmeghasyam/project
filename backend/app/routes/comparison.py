import uuid
import time
from datetime import datetime, timezone
from fastapi import APIRouter
from app.models.schemas import ModelComparisonRequest, ModelComparisonResponse, EvaluationResponse
from app.services.hallucination_engine import analyze_claims_against_reference, compute_reliability_score
from app.services.metrics_engine import calculate_performance

router = APIRouter(tags=["Model Comparison"])

def run_single_eval(prompt: str, answer: str, reference: str, model_name: str) -> EvaluationResponse:
    start = time.perf_counter()
    claims = analyze_claims_against_reference(answer, reference)
    score, risk_level, warnings, explanation = compute_reliability_score(claims)
    elapsed_ms = (time.perf_counter() - start) * 1000.0

    perf = calculate_performance(
        prompt=prompt,
        ai_answer=answer,
        response_time_ms=elapsed_ms,
        model_name=model_name
    )

    supp = sum(1 for c in claims if c.status == "Supported")
    part = sum(1 for c in claims if c.status == "Partially Supported")
    unsupp = sum(1 for c in claims if c.status == "Unsupported")
    contra = sum(1 for c in claims if c.status == "Contradicted")

    return EvaluationResponse(
        id=f"eval-{uuid.uuid4().hex[:8]}",
        timestamp=datetime.now(timezone.utc).isoformat(),
        prompt=prompt,
        ai_answer=answer,
        reference_text=reference,
        model_name=model_name,
        reliability_score=score,
        risk_level=risk_level,
        total_claims=len(claims),
        supported_count=supp,
        partially_supported_count=part,
        unsupported_count=unsupp,
        contradicted_count=contra,
        claims=claims,
        warnings=warnings,
        explanation=explanation,
        performance=perf,
        scoring_breakdown={
            "supported_points": supp * 100.0,
            "partially_supported_points": part * 60.0,
            "unsupported_points": unsupp * 20.0,
            "contradicted_penalty": contra * 20.0,
            "final_score": score
        }
    )

@router.post("/compare-models", response_model=ModelComparisonResponse)
async def compare_models(req: ModelComparisonRequest):
    eval_a = run_single_eval(req.prompt, req.model_a_answer, req.reference_text, req.model_a_name)
    eval_b = run_single_eval(req.prompt, req.model_b_answer, req.reference_text, req.model_b_name)

    score_diff = round(abs(eval_a.reliability_score - eval_b.reliability_score), 1)

    if eval_a.reliability_score > eval_b.reliability_score:
        winner = req.model_a_name
        summary = (
            f"{req.model_a_name} scored higher ({eval_a.reliability_score} vs {eval_b.reliability_score}). "
            f"It demonstrated {eval_a.supported_count} supported claims with {eval_a.contradicted_count} contradictions, "
            f"compared to {eval_b.supported_count} supported claims and {eval_b.contradicted_count} contradictions for {req.model_b_name}."
        )
    elif eval_b.reliability_score > eval_a.reliability_score:
        winner = req.model_b_name
        summary = (
            f"{req.model_b_name} scored higher ({eval_b.reliability_score} vs {eval_a.reliability_score}). "
            f"It demonstrated {eval_b.supported_count} supported claims with {eval_b.contradicted_count} contradictions, "
            f"compared to {eval_a.supported_count} supported claims and {eval_a.contradicted_count} contradictions for {req.model_a_name}."
        )
    else:
        winner = "Tie (Equal Reliability)"
        summary = f"Both models achieved an identical reliability score of {eval_a.reliability_score}/100."

    return ModelComparisonResponse(
        comparison_id=f"cmp-{uuid.uuid4().hex[:8]}",
        timestamp=datetime.now(timezone.utc).isoformat(),
        prompt=req.prompt,
        reference_text=req.reference_text,
        model_a_name=req.model_a_name,
        model_b_name=req.model_b_name,
        model_a_eval=eval_a,
        model_b_eval=eval_b,
        winner=winner,
        comparison_summary=summary,
        score_difference=score_diff
    )
