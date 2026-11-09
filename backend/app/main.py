from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database.mongo import db_manager
from app.routes import evaluate, hallucination, injection, json_validator, comparison, history, dashboard

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB or establish fallback
    print(f"[*] Starting {settings.APP_NAME} v{settings.APP_VERSION}...")
    await db_manager.connect()
    yield
    # Shutdown: Close database client
    print("[*] Shutting down TrustLens AI backend...")
    await db_manager.close()

app = FastAPI(
    title=settings.APP_NAME,
    description="Intelligent AI Response Reliability Auditor - Backend REST API",
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# Enable CORS for local Vite frontend and general clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers under /api prefix for clean frontend routing
api_prefix = "/api"
app.include_router(dashboard.router, prefix=api_prefix)
app.include_router(evaluate.router, prefix=api_prefix)
app.include_router(hallucination.router, prefix=api_prefix)
app.include_router(injection.router, prefix=api_prefix)
app.include_router(json_validator.router, prefix=api_prefix)
app.include_router(comparison.router, prefix=api_prefix)
app.include_router(history.router, prefix=api_prefix)

# Also include directly at root to satisfy requirements
app.include_router(dashboard.router)
app.include_router(evaluate.router)
app.include_router(hallucination.router)
app.include_router(injection.router)
app.include_router(json_validator.router)
app.include_router(comparison.router)
app.include_router(history.router)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "database": db_manager.db_type,
        "llm_engine": "Rule-Based + LLM Hybrid"
    }

@app.get("/")
async def root():
    return {
        "message": "Welcome to TrustLens AI - Intelligent AI Response Reliability Auditor",
        "docs_url": "/docs",
        "health_check": "/health"
    }

