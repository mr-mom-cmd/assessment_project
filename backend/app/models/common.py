from pydantic import BaseModel


class STTResponse(BaseModel):
    text: str


class TTSRequest(BaseModel):
    text: str
