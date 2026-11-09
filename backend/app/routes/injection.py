from fastapi import APIRouter
from app.models.schemas import PromptInjectionRequest, PromptInjectionResponse
from app.services.injection_engine import analyze_prompt_injection

router = APIRouter(tags=["Prompt Injection Defense"])

@router.post("/test-prompt-injection", response_model=PromptInjectionResponse)
async def test_prompt_injection(req: PromptInjectionRequest):
    return analyze_prompt_injection(
        prompt=req.prompt,
        sample_response=req.sample_response
    )

