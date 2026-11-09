from datetime import datetime, timezone
from typing import Optional
from app.models.schemas import PerformanceMetrics

# Known pricing per 1K tokens for popular models (input/output blended average)
MODEL_PRICING_PER_1K = {
    "gemini-1.5-flash": 0.00035,
    "gemini-1.5-pro": 0.0035,
    "gpt-4o-mini": 0.00060,
    "gpt-4o": 0.00500,
    "claude-3-haiku": 0.00025,
}

def estimate_tokens(text: str) -> int:
    """
    Standard NLP heuristic: 1 token is approximately 4 characters or 0.75 words.
    Safe, transparent estimation for models without a direct tokenizer.
    """
    if not text:
        return 0
    char_estimate = len(text) / 4.0
    word_estimate = len(text.split()) / 0.75
    return max(1, int((char_estimate + word_estimate) / 2))

def calculate_performance(
    prompt: str,
    ai_answer: str,
    response_time_ms: float,
    model_name: str = "gemini-1.5-flash"
) -> PerformanceMetrics:
    """
    Calculates transparent performance metrics including latency,
    heuristic token usage, and cost estimates when known.
    """
    total_text = f"{prompt}\n{ai_answer}"
    tokens = estimate_tokens(total_text)

    # Calculate cost if model pricing is configured
    model_key = model_name.lower().strip()
    rate_per_1k = MODEL_PRICING_PER_1K.get(model_key)
    
    if rate_per_1k is not None:
        cost = round((tokens / 1000.0) * rate_per_1k, 6)
        cost_status = "Estimated"
    else:
        cost = None
        cost_status = "Unavailable (Pricing not configured for this model)"

    return PerformanceMetrics(
        response_time_ms=round(response_time_ms, 1),
        estimated_tokens=tokens,
        estimated_cost_usd=cost,
        cost_status=cost_status,
        model_name=model_name,
        evaluated_at=datetime.now(timezone.utc).isoformat()
    )
