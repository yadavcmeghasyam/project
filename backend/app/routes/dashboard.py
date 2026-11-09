import os
from fastapi import APIRouter
from app.models.schemas import DashboardStatsResponse
from app.database.mongo import db_manager
from app.config import settings
from app.services.llm_service import llm_service

router = APIRouter(tags=["Dashboard & Settings"])

@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
async def get_dashboard_statistics():
    return await db_manager.get_dashboard_stats()

@router.get("/settings/status")
async def get_system_settings_status():
    """
    Returns non-sensitive system status and configuration state.
    Never returns secret keys!
    """
    return {
        "app_name": settings.APP_NAME,
        "app_version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "database_type": db_manager.db_type,
        "is_mongodb_connected": db_manager.is_connected,
        "llm_provider": llm_service.get_active_provider(),
        "is_llm_api_configured": llm_service.is_api_available(),
        "gemini_configured": bool(settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")),
        "openai_configured": bool(settings.OPENAI_API_KEY or os.environ.get("OPENAI_API_KEY")),
        "default_model": settings.DEFAULT_MODEL
    }

