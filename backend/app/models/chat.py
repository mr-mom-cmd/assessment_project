from typing import List, Literal, Optional
from pydantic import BaseModel


class ChatTurn(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatTurn]] = None


class ChatResponse(BaseModel):
    reply: str
