from fastapi import APIRouter
from app.models.schemas import JsonValidationRequest, JsonValidationResponse
from app.services.json_engine import validate_json_structure

router = APIRouter(tags=["JSON Validator"])

@router.post("/validate-json", response_model=JsonValidationResponse)
async def validate_json(req: JsonValidationRequest):
    return validate_json_structure(
        raw_input=req.json_input,
        required_keys=req.required_keys,
        expected_types=req.expected_types
    )

