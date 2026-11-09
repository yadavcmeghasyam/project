from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from app.database.mongo import db_manager

router = APIRouter(tags=["Evaluation History"])

@router.get("/history")
async def get_history(
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = Query(None, description="Search keyword in prompt, answer, model, or risk level")
):
    try:
        evaluations = await db_manager.get_evaluations(limit=limit, search=search)
        return {
            "count": len(evaluations),
            "evaluations": evaluations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve evaluation history: {str(e)}")

@router.get("/history/{eval_id}")
async def get_single_evaluation(eval_id: str):
    eval_doc = await db_manager.get_evaluation_by_id(eval_id)
    if not eval_doc:
        raise HTTPException(status_code=404, detail=f"Evaluation with ID '{eval_id}' was not found.")
    return eval_doc

@router.delete("/history/{eval_id}")
async def delete_single_evaluation(eval_id: str):
    success = await db_manager.delete_evaluation(eval_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Evaluation with ID '{eval_id}' was not found or could not be deleted.")
    return {"status": "success", "message": f"Evaluation '{eval_id}' deleted successfully."}
