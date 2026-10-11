from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.routes import router as api_router
from app.api.websocket import router as ws_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"[vnavhomelab] Telemetry Server starting on {settings.HOST}:{settings.PORT}")
    print(f"[vnavhomelab] Hardware Target: Raspberry Pi 5 / Linux aarch64 (Host: {settings.HOSTNAME})")
    yield
    print(f"[vnavhomelab] Server shutting down")

app = FastAPI(
    title="vnavhomelab - Raspberry Pi 5 Telemetry API",
    version=settings.VERSION,
    description="Real-time hardware telemetry and container management API for vnavhomelab",
    lifespan=lifespan
)

# CORS middleware for local development and dashboard access
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API and WebSocket routers
app.include_router(api_router, prefix="/api")
app.include_router(ws_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=False)
