import os
import json
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from app.config import settings

LOCAL_STORAGE_FILE = os.path.join(os.path.dirname(__file__), "local_evaluations.json")

class LocalJSONDatabase:
    """
    Beginner-friendly fallback database.
    Stores evaluations in a local JSON file if MongoDB service is not started.
    Ensures zero friction for students testing or demonstrating the project!
    """
    def __init__(self, filepath: str = LOCAL_STORAGE_FILE):
        self.filepath = filepath
        self._ensure_file()

    def _ensure_file(self):
        if not os.path.exists(self.filepath):
            # Seed initial demo evaluation so the dashboard looks alive immediately
            seed_data = [
                {
                    "id": "seed-eval-001",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "prompt": "What is the capital of Australia and what is its population?",
                    "ai_answer": "The capital of Australia is Canberra. It was founded following the federation of Australia in 1913. As of recent estimates, Canberra has a population of approximately 460,000 residents.",
                    "reference_text": "Canberra is the federal capital of Australia. Founded in 1913, the city is home to roughly 456,000 residents according to the Australian Bureau of Statistics.",
                    "model_name": "gemini-1.5-flash",
                    "reliability_score": 92.5,
                    "risk_level": "Reliable",
                    "total_claims": 3,
                    "supported_count": 2,
                    "partially_supported_count": 1,
                    "unsupported_count": 0,
                    "contradicted_count": 0,
                    "claims": [
                        {
                            "claim_id": 1,
                            "claim_text": "The capital of Australia is Canberra.",
                            "status": "Supported",
                            "confidence": 0.98,
                            "reasoning": "Direct match with reference text: 'Canberra is the federal capital of Australia.'",
                            "matched_reference_segment": "Canberra is the federal capital of Australia.",
                            "similarity_score": 0.95
                        },
                        {
                            "claim_id": 2,
                            "claim_text": "It was founded following the federation of Australia in 1913.",
                            "status": "Supported",
                            "confidence": 0.94,
                            "reasoning": "Matches founding date 1913 in reference text.",
                            "matched_reference_segment": "Founded in 1913",
                            "similarity_score": 0.91
                        },
                        {
                            "claim_id": 3,
                            "claim_text": "Canberra has a population of approximately 460,000 residents.",
                            "status": "Partially Supported",
                            "confidence": 0.85,
                            "reasoning": "Reference states roughly 456,000; answer states approximately 460,000 (close approximation).",
                            "matched_reference_segment": "home to roughly 456,000 residents",
                            "similarity_score": 0.82
                        }
                    ],
                    "warnings": [],
                    "explanation": "High reliability. Claims are grounded in the reference document with minor rounding on the population figure.",
                    "performance": {
                        "response_time_ms": 420.5,
                        "estimated_tokens": 128,
                        "estimated_cost_usd": 0.000045,
                        "cost_status": "Estimated",
                        "model_name": "gemini-1.5-flash",
                        "evaluated_at": datetime.now(timezone.utc).isoformat()
                    },
                    "scoring_breakdown": {
                        "supported_weight": 1.0,
                        "partially_supported_weight": 0.6,
                        "raw_score": 92.5
                    }
                },
                {
                    "id": "seed-eval-002",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "prompt": "Explain the speed of light and sound.",
                    "ai_answer": "The speed of light in vacuum is approximately 300,000 km/s. Sound travels faster than light in dense materials such as steel at 1,000,000 km/s.",
                    "reference_text": "Light travels at roughly 299,792 km/s in a vacuum. Sound waves require a medium and travel much slower, around 343 m/s in air and 5,960 m/s in steel.",
                    "model_name": "demo-model-v1",
                    "reliability_score": 45.0,
                    "risk_level": "High Risk",
                    "total_claims": 2,
                    "supported_count": 1,
                    "partially_supported_count": 0,
                    "unsupported_count": 0,
                    "contradicted_count": 1,
                    "claims": [
                        {
                            "claim_id": 1,
                            "claim_text": "The speed of light in vacuum is approximately 300,000 km/s.",
                            "status": "Supported",
                            "confidence": 0.96,
                            "reasoning": "Corresponds to 299,792 km/s in reference text.",
                            "matched_reference_segment": "Light travels at roughly 299,792 km/s in a vacuum.",
                            "similarity_score": 0.94
                        },
                        {
                            "claim_id": 2,
                            "claim_text": "Sound travels faster than light in dense materials such as steel at 1,000,000 km/s.",
                            "status": "Contradicted",
                            "confidence": 0.99,
                            "reasoning": "Direct contradiction: reference states sound travels at 5,960 m/s in steel, far slower than light.",
                            "matched_reference_segment": "Sound waves require a medium and travel much slower, around 343 m/s in air and 5,960 m/s in steel.",
                            "similarity_score": 0.2
                        }
                    ],
                    "warnings": [
                        "Severe contradiction detected regarding physical constant: sound speed vs light speed.",
                        "Extreme numeric hallucination: 1,000,000 km/s for sound in steel."
                    ],
                    "explanation": "Critical hallucination and scientific contradiction detected in the AI response.",
                    "performance": {
                        "response_time_ms": 310.2,
                        "estimated_tokens": 98,
                        "estimated_cost_usd": 0.000034,
                        "cost_status": "Estimated",
                        "model_name": "demo-model-v1",
                        "evaluated_at": datetime.now(timezone.utc).isoformat()
                    },
                    "scoring_breakdown": {
                        "contradiction_penalty": -50.0,
                        "raw_score": 45.0
                    }
                }
            ]
            with open(self.filepath, "w", encoding="utf-8") as f:
                json.dump(seed_data, f, indent=2)

    def _read_all(self) -> List[Dict[str, Any]]:
        self._ensure_file()
        try:
            with open(self.filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

    def _write_all(self, data: List[Dict[str, Any]]):
        with open(self.filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    async def insert_evaluation(self, evaluation: Dict[str, Any]) -> str:
        data = self._read_all()
        data.insert(0, evaluation)
        self._write_all(data)
        return evaluation["id"]

    async def get_evaluations(self, limit: int = 50, search: Optional[str] = None) -> List[Dict[str, Any]]:
        data = self._read_all()
        if search:
            query = search.lower()
            data = [
                e for e in data
                if query in e.get("prompt", "").lower()
                or query in e.get("ai_answer", "").lower()
                or query in e.get("model_name", "").lower()
                or query in e.get("risk_level", "").lower()
            ]
        return data[:limit]

    async def get_evaluation_by_id(self, eval_id: str) -> Optional[Dict[str, Any]]:
        data = self._read_all()
        for item in data:
            if item.get("id") == eval_id:
                return item
        return None

    async def delete_evaluation(self, eval_id: str) -> bool:
        data = self._read_all()
        original_len = len(data)
        data = [item for item in data if item.get("id") != eval_id]
        if len(data) < original_len:
            self._write_all(data)
            return True
        return False


class DatabaseManager:
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None
        self.is_connected: bool = False
        self.local_db = LocalJSONDatabase()
        self.db_type = "Local Storage (Demo Mode)"

    async def connect(self):
        try:
            # Set 1.5 second timeout so startup is instantaneous even if MongoDB is absent
            self.client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=1500
            )
            # Ping database to verify connection
            await self.client.admin.command('ping')
            self.db = self.client[settings.MONGODB_DB_NAME]
            self.is_connected = True
            self.db_type = "MongoDB"
            print(f"[*] Successfully connected to MongoDB at {settings.MONGODB_URI}")
        except Exception as e:
            self.is_connected = False
            self.db_type = "Local Storage (Demo Mode)"
            print(f"[!] MongoDB not available ({e}). Using local fallback storage.")

    async def close(self):
        if self.client:
            self.client.close()

    async def save_evaluation(self, evaluation: Dict[str, Any]) -> str:
        if not evaluation.get("id"):
            evaluation["id"] = f"eval-{uuid.uuid4().hex[:8]}"
        if not evaluation.get("timestamp"):
            evaluation["timestamp"] = datetime.now(timezone.utc).isoformat()

        if self.is_connected and self.db is not None:
            try:
                # MongoDB requires _id, so we map id to _id
                doc = dict(evaluation)
                doc["_id"] = doc["id"]
                await self.db.evaluations.replace_one({"_id": doc["_id"]}, doc, upsert=True)
                return evaluation["id"]
            except Exception as e:
                print(f"[!] MongoDB save error: {e}, saving to local fallback.")
        
        return await self.local_db.insert_evaluation(evaluation)

    async def get_evaluations(self, limit: int = 50, search: Optional[str] = None) -> List[Dict[str, Any]]:
        if self.is_connected and self.db is not None:
            try:
                query = {}
                if search:
                    regex_pattern = {"$regex": search, "$options": "i"}
                    query = {
                        "$or": [
                            {"prompt": regex_pattern},
                            {"ai_answer": regex_pattern},
                            {"model_name": regex_pattern},
                            {"risk_level": regex_pattern}
                        ]
                    }
                cursor = self.db.evaluations.find(query).sort("timestamp", -1).limit(limit)
                results = []
                async for doc in cursor:
                    if "_id" in doc:
                        del doc["_id"]
                    results.append(doc)
                return results
            except Exception as e:
                print(f"[!] MongoDB fetch error: {e}, fetching from local fallback.")

        return await self.local_db.get_evaluations(limit, search)

    async def get_evaluation_by_id(self, eval_id: str) -> Optional[Dict[str, Any]]:
        if self.is_connected and self.db is not None:
            try:
                doc = await self.db.evaluations.find_one({"_id": eval_id})
                if doc:
                    if "_id" in doc:
                        del doc["_id"]
                    return doc
            except Exception as e:
                print(f"[!] MongoDB find error: {e}")

        return await self.local_db.get_evaluation_by_id(eval_id)

    async def delete_evaluation(self, eval_id: str) -> bool:
        if self.is_connected and self.db is not None:
            try:
                result = await self.db.evaluations.delete_one({"_id": eval_id})
                if result.deleted_count > 0:
                    return True
            except Exception as e:
                print(f"[!] MongoDB delete error: {e}")

        return await self.local_db.delete_evaluation(eval_id)

    async def get_dashboard_stats(self) -> Dict[str, Any]:
        evals = await self.get_evaluations(limit=200)
        total = len(evals)
        
        if total == 0:
            return {
                "total_evaluations": 0,
                "reliable_count": 0,
                "warning_count": 0,
                "high_risk_count": 0,
                "avg_reliability_score": 0.0,
                "recent_evaluations": [],
                "score_distribution": [
                    {"range": "0-40 (High Risk)", "count": 0},
                    {"range": "41-70 (Warning)", "count": 0},
                    {"range": "71-100 (Reliable)", "count": 0}
                ],
                "database_status": "Connected" if self.is_connected else "Local Demo Mode",
                "database_type": self.db_type
            }

        reliable = sum(1 for e in evals if e.get("risk_level") == "Reliable")
        warning = sum(1 for e in evals if e.get("risk_level") == "Warning")
        high_risk = sum(1 for e in evals if e.get("risk_level") == "High Risk")
        avg_score = round(sum(e.get("reliability_score", 0.0) for e in evals) / total, 1)

        # Score distribution for charts
        dist_low = sum(1 for e in evals if e.get("reliability_score", 0) <= 40)
        dist_med = sum(1 for e in evals if 40 < e.get("reliability_score", 0) <= 70)
        dist_high = sum(1 for e in evals if e.get("reliability_score", 0) > 70)

        distribution = [
            {"range": "0-40 (High Risk)", "count": dist_low},
            {"range": "41-70 (Warning)", "count": dist_med},
            {"range": "71-100 (Reliable)", "count": dist_high}
        ]

        # Recent 5 evaluations for quick view
        recent = [
            {
                "id": e.get("id"),
                "timestamp": e.get("timestamp"),
                "prompt": e.get("prompt")[:60] + ("..." if len(e.get("prompt", "")) > 60 else ""),
                "model_name": e.get("model_name"),
                "score": e.get("reliability_score"),
                "risk_level": e.get("risk_level")
            }
            for e in evals[:6]
        ]

        return {
            "total_evaluations": total,
            "reliable_count": reliable,
            "warning_count": warning,
            "high_risk_count": high_risk,
            "avg_reliability_score": avg_score,
            "recent_evaluations": recent,
            "score_distribution": distribution,
            "database_status": "Connected" if self.is_connected else "Local Demo Mode",
            "database_type": self.db_type
        }

db_manager = DatabaseManager()

