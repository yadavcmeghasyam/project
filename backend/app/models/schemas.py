from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime

# -------------------------------------------------------------
# Claim Analysis Models
# -------------------------------------------------------------
class ClaimEvaluation(BaseModel):
    claim_id: int
    claim_text: str
    status: Literal["Supported", "Partially Supported", "Unsupported", "Contradicted"]
    confidence: float = Field(..., ge=0.0, le=1.0)
    reasoning: str
    matched_reference_segment: Optional[str] = None
    similarity_score: float = Field(0.0, ge=0.0, le=1.0)

# -------------------------------------------------------------
# Performance Metrics
# -------------------------------------------------------------
class PerformanceMetrics(BaseModel):
    response_time_ms: float
    estimated_tokens: int
    estimated_cost_usd: Optional[float] = None
    cost_status: str = "Estimated"
    model_name: str
    evaluated_at: str

# -------------------------------------------------------------
# Evaluation Request & Response
# -------------------------------------------------------------
class EvaluationRequest(BaseModel):
    prompt: str = Field(..., min_length=3, description="User prompt or instruction given to the AI")
    ai_answer: str = Field(..., min_length=3, description="AI-generated response to be audited")
    reference_text: str = Field(..., min_length=3, description="Ground truth or reference document")
    model_name: Optional[str] = "gemini-1.5-flash"
    use_llm_if_available: bool = True

class EvaluationResponse(BaseModel):
    id: str
    timestamp: str
    prompt: str
    ai_answer: str
    reference_text: str
    model_name: str
    reliability_score: float = Field(..., ge=0.0, le=100.0)
    risk_level: Literal["Reliable", "Warning", "High Risk"]
    total_claims: int
    supported_count: int
    partially_supported_count: int
    unsupported_count: int
    contradicted_count: int
    claims: List[ClaimEvaluation]
    warnings: List[str]
    explanation: str
    performance: PerformanceMetrics
    scoring_breakdown: Dict[str, Any]

# -------------------------------------------------------------
# Hallucination Risk Request & Response
# -------------------------------------------------------------
class HallucinationRequest(BaseModel):
    ai_answer: str = Field(..., min_length=3)
    reference_text: str = Field(..., min_length=3)
    model_name: Optional[str] = "gemini-1.5-flash"

class HallucinationResponse(BaseModel):
    overall_hallucination_rate: float
    total_claims: int
    supported_count: int
    partially_supported_count: int
    unsupported_count: int
    contradicted_count: int
    claims: List[ClaimEvaluation]
    hallucination_summary: str
    risk_verdict: str

# -------------------------------------------------------------
# Prompt Injection Tester Models
# -------------------------------------------------------------
class DetectedPattern(BaseModel):
    category: str
    pattern_name: str
    matched_phrase: str
    risk_contribution: int
    explanation: str
    severity: Literal["Low", "Medium", "High", "Critical"]

class PromptInjectionRequest(BaseModel):
    prompt: str = Field(..., min_length=2)
    sample_response: Optional[str] = None

class PromptInjectionResponse(BaseModel):
    is_injection_detected: bool
    threat_level: Literal["Safe", "Low", "Medium", "High", "Critical"]
    risk_score: float = Field(..., ge=0.0, le=100.0)
    detected_patterns: List[DetectedPattern]
    explanations: List[str]
    recommendations: List[str]
    tested_at: str

# -------------------------------------------------------------
# JSON Validator Models
# -------------------------------------------------------------
class JsonValidationRequest(BaseModel):
    json_input: str
    required_keys: Optional[List[str]] = []
    expected_types: Optional[Dict[str, str]] = {}  # e.g., {"id": "integer", "email": "string"}

class JsonValidationResponse(BaseModel):
    is_valid_json: bool
    has_required_keys: bool
    types_match: bool
    errors: List[str]
    warnings: List[str]
    parsed_data: Optional[Any] = None
    field_count: int = 0
    validated_at: str

# -------------------------------------------------------------
# Model Comparison Models
# -------------------------------------------------------------
class ModelComparisonRequest(BaseModel):
    prompt: str = Field(..., min_length=3)
    reference_text: str = Field(..., min_length=3)
    model_a_name: str = "Model A (e.g. Gemini-1.5)"
    model_a_answer: str = Field(..., min_length=3)
    model_b_name: str = "Model B (e.g. GPT-4o-Mini)"
    model_b_answer: str = Field(..., min_length=3)

class ModelComparisonResponse(BaseModel):
    comparison_id: str
    timestamp: str
    prompt: str
    reference_text: str
    model_a_name: str
    model_b_name: str
    model_a_eval: EvaluationResponse
    model_b_eval: EvaluationResponse
    winner: Optional[str] = None
    comparison_summary: str
    score_difference: float

# -------------------------------------------------------------
# Dashboard & History Models
# -------------------------------------------------------------
class DashboardStatsResponse(BaseModel):
    total_evaluations: int
    reliable_count: int
    warning_count: int
    high_risk_count: int
    avg_reliability_score: float
    recent_evaluations: List[Dict[str, Any]]
    score_distribution: List[Dict[str, Any]]
    database_status: str
    database_type: str

