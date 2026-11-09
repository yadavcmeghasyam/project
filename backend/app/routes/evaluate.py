import time
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from app.models.schemas import EvaluationRequest, EvaluationResponse, ClaimEvaluation
from app.services.hallucination_engine import analyze_claims_against_reference, compute_reliability_score
from app.services.metrics_engine import calculate_performance
from app.services.llm_service import llm_service
from app.database.mongo import db_manager

router = APIRouter(tags=["Reliability Evaluation"])

@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_response(req: EvaluationRequest):
    start_time = time.perf_counter()

    claims = []
    explanation = ""

    # Step 1: Check if external LLM API is available and requested
    if req.use_llm_if_available and llm_service.is_api_available():
        gemini_result = await llm_service.evaluate_with_gemini(
            prompt=req.prompt,
            ai_answer=req.ai_answer,
            reference_text=req.reference_text
        )
        if gemini_result and "claims" in gemini_result:
            try:
                for idx, c in enumerate(gemini_result["claims"], start=1):
                    claims.append(
                        ClaimEvaluation(
                            claim_id=idx,
                            claim_text=c.get("claim_text", ""),
                            status=c.get("status", "Unsupported"),
                            confidence=float(c.get("confidence", 0.9)),
                            reasoning=c.get("reasoning", "LLM semantic evaluation."),
                            matched_reference_segment=c.get("matched_reference_segment")
                        )
                    )
                explanation = gemini_result.get("explanation", "")
            except Exception as e:
                print(f"[!] Error parsing LLM response: {e}, falling back to rule-based.")
                claims = []

    # Step 2: Fallback to high-speed deterministic rule-based auditor
    if not claims:
        claims = analyze_claims_against_reference(req.ai_answer, req.reference_text)

    # Step 3: Compute transparent score and risk classification
    score, risk_level, warnings, default_explanation = compute_reliability_score(claims)
    if not explanation:
        explanation = default_explanation

    elapsed_ms = (time.perf_counter() - start_time) * 1000.0

    # Step 4: Calculate performance metrics
    performance = calculate_performance(
        prompt=req.prompt,
        ai_answer=req.ai_answer,
        response_time_ms=elapsed_ms,
        model_name=req.model_name or "gemini-1.5-flash"
    )

    # Count claim statuses
    supp = sum(1 for c in claims if c.status == "Supported")
    part = sum(1 for c in claims if c.status == "Partially Supported")
    unsupp = sum(1 for c in claims if c.status == "Unsupported")
    contra = sum(1 for c in claims if c.status == "Contradicted")

    eval_id = f"eval-{uuid.uuid4().hex[:8]}"
    timestamp = datetime.now(timezone.utc).isoformat()

    response = EvaluationResponse(
        id=eval_id,
        timestamp=timestamp,
        prompt=req.prompt,
        ai_answer=req.ai_answer,
        reference_text=req.reference_text,
        model_name=req.model_name or "gemini-1.5-flash",
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
        performance=performance,
        scoring_breakdown={
            "supported_points": supp * 100.0,
            "partially_supported_points": part * 60.0,
            "unsupported_points": unsupp * 20.0,
            "contradicted_penalty": contra * 20.0,
            "final_score": score
        }
    )

    # Step 5: Save to database (MongoDB or local JSON fallback)
    try:
        await db_manager.save_evaluation(response.model_dump())
    except Exception as e:
        print(f"[!] Warning: Failed to persist evaluation: {e}")

    return response
