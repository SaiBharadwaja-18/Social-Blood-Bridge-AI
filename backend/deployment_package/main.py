"""
Blood Bridge AI — Main FastAPI Application
Run locally: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.auth          import router as auth_router
from routes.donors        import router as donors_router
from routes.requests      import router as requests_router
from routes.ai            import router as ai_router
from routes.notifications import router as notifications_router

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Blood Bridge AI",
    description="AI-powered blood coordination platform for Thalassemia patients",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(donors_router)
app.include_router(requests_router)
app.include_router(ai_router)
app.include_router(notifications_router)

# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "status":  "ok",
        "message": "Blood Bridge AI API is running",
        "version": "1.0.0",
        "docs":    "/docs",
    }

@app.get("/health")
def health():
    return {"status": "healthy"}    