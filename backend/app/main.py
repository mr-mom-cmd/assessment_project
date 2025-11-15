from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import health, chat, voice
from .utils.config import get_settings

settings = get_settings()

app = FastAPI(
    title="Customer Service Voice Bot API",
    version="1.0.0",
)

# CORS
origins = ["*"]
if settings.frontend_origin:
    origins = [settings.frontend_origin]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(voice.router, prefix="/api/voice", tags=["voice"])


@app.get("/")
async def root():
    return {"message": "Voice Bot API is running"}
