import json
import re
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from app.models.schemas import JsonValidationResponse

TYPE_MAPPINGS = {
    "string": str,
    "str": str,
    "integer": int,
    "int": int,
    "number": (int, float),
    "float": float,
    "boolean": bool,
    "bool": bool,
    "array": list,
    "list": list,
    "object": dict,
    "dict": dict
}

def clean_markdown_json(raw_input: str) -> str:
    """Strip triple backtick markdown code blocks if the user copied raw LLM output."""
    text = raw_input.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1).strip()
    return text

def validate_json_structure(
    raw_input: str,
    required_keys: Optional[List[str]] = None,
    expected_types: Optional[Dict[str, str]] = None
) -> JsonValidationResponse:
    """
    Validates JSON syntax, required fields, and data types.
    Identifies exact syntax errors, line and column numbers.
    """
    cleaned = clean_markdown_json(raw_input)
    errors: List[str] = []
    warnings: List[str] = []
    parsed_data = None
    is_valid = False
    has_required = True
    types_match = True
    field_count = 0

    if not cleaned:
        return JsonValidationResponse(
            is_valid_json=False,
            has_required_keys=False,
            types_match=False,
            errors=["Input JSON string is completely empty."],
            warnings=[],
            parsed_data=None,
            field_count=0,
            validated_at=datetime.now(timezone.utc).isoformat()
        )

    # 1. Syntax Validation
    try:
        parsed_data = json.loads(cleaned)
        is_valid = True
    except json.JSONDecodeError as err:
        is_valid = False
        has_required = False
        types_match = False
        line_num = err.lineno
        col_num = err.colno
        msg = err.msg

        # Provide friendly hint based on error type
        hint = ""
        if "Expecting property name enclosed in double quotes" in msg:
            hint = "Hint: JSON requires double quotes (\") around keys, not single quotes or unquoted keys."
        elif "Expecting ',' delimiter" in msg:
            hint = "Hint: Missing a comma between fields or array items."
        elif "Unterminated string" in msg:
            hint = "Hint: A string was opened with a quote but never closed."
        elif "Extra data" in msg:
            hint = "Hint: Trailing characters or multiple JSON roots found."

        error_desc = f"Syntax Error at Line {line_num}, Column {col_num}: {msg}."
        if hint:
            error_desc += f" {hint}"
        errors.append(error_desc)

        return JsonValidationResponse(
            is_valid_json=False,
            has_required_keys=False,
            types_match=False,
            errors=errors,
            warnings=warnings,
            parsed_data=None,
            field_count=0,
            validated_at=datetime.now(timezone.utc).isoformat()
        )

    # 2. Check structure
    if isinstance(parsed_data, dict):
        field_count = len(parsed_data)
        
        # Check required keys
        if required_keys:
            for key in required_keys:
                key_clean = key.strip()
                if not key_clean:
                    continue
                if key_clean not in parsed_data:
                    errors.append(f"Missing required field: '{key_clean}'")
                    has_required = False
                elif parsed_data[key_clean] is None:
                    warnings.append(f"Required field '{key_clean}' is present but has a null value.")

        # Check data types
        if expected_types:
            for field, type_name in expected_types.items():
                if field in parsed_data and parsed_data[field] is not None:
                    expected_python_type = TYPE_MAPPINGS.get(type_name.lower())
                    if expected_python_type:
                        actual_val = parsed_data[field]
                        # Special case: bool is subclass of int in Python, check bool first
                        if expected_python_type == int and isinstance(actual_val, bool):
                            errors.append(f"Field '{field}' expected type '{type_name}', but received 'boolean'.")
                            types_match = False
                        elif not isinstance(actual_val, expected_python_type):
                            errors.append(
                                f"Field '{field}' expected type '{type_name}', but received '{type(actual_val).__name__}'."
                            )
                            types_match = False
    elif isinstance(parsed_data, list):
        field_count = len(parsed_data)
        if required_keys:
            warnings.append("Root JSON is an Array/List; required key checks apply to Object root structures.")
    else:
        field_count = 1

    return JsonValidationResponse(
        is_valid_json=is_valid,
        has_required_keys=has_required,
        types_match=types_match,
        errors=errors,
        warnings=warnings,
        parsed_data=parsed_data,
        field_count=field_count,
        validated_at=datetime.now(timezone.utc).isoformat()
    )

