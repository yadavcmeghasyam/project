import os
import json
import httpx
from typing import Optional, List, Dict, Any
from app.config import settings

class LLMService:
    """
    Integrates external LLM API (Google Gemini or OpenAI) when configured.
    Falls back gracefully to demo/rule-based evaluation when no API key is provided.
    Never exposes keys or crashes on missing credentials.
    """
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        self.openai_key = settings.OPENAI_API_KEY or os.environ.get("OPENAI_API_KEY")

    def is_api_available(self) -> bool:
        return bool(self.gemini_key or self.openai_key)

    def get_active_provider(self) -> str:
        if self.gemini_key:
            return "Google Gemini"
        if self.openai_key:
            return "OpenAI"
        return "Built-in Rule-Based Engine (Demo Mode)"

    async def evaluate_with_gemini(self, prompt: str, ai_answer: str, reference_text: str) -> Optional[Dict[str, Any]]:
        """
        Calls Google Gemini REST API to perform deep semantic claim verification.
        """
        if not self.gemini_key:
            return None

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
        
        system_instruction = (
            "You are TrustLens AI auditor. Compare the provided AI answer against the reference text. "
            "Decompose the answer into distinct claims. For each claim, classify it as Supported, "
            "Partially Supported, Unsupported, or Contradicted. "
            "Respond ONLY with a JSON object in this format:\n"
            "{\n"
            '  "claims": [\n'
            '    {\n'
            '      "claim_id": 1,\n'
            '      "claim_text": "text",\n'
            '      "status": "Supported" | "Partially Supported" | "Unsupported" | "Contradicted",\n'
            '      "confidence": 0.95,\n'
            '      "reasoning": "brief explanation",\n'
            '      "matched_reference_segment": "quote from reference"\n'
            '    }\n'
            '  ],\n'
            '  "explanation": "overall summary"\n'
            "}"
        )

        user_content = (
            f"PROMPT:\n{prompt}\n\n"
            f"REFERENCE TEXT:\n{reference_text}\n\n"
            f"AI ANSWER TO EVALUATE:\n{ai_answer}"
        )

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": system_instruction},
                        {"text": user_content}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "response_mime_type": "application/json"
            }
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidate_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    return json.loads(candidate_text)
                else:
                    print(f"[!] Gemini API returned status {res.status_code}: {res.text}")
                    return None
        except Exception as e:
            print(f"[!] Gemini API evaluation error: {e}. Falling back to rule-based engine.")
            return None

llm_service = LLMService()
