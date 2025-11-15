from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from ..models.common import STTResponse, TTSRequest
from ..services.stt_service import transcribe_audio
from ..services.tts_service import synthesize_speech

router = APIRouter()


@router.post("/stt", response_model=STTResponse)
async def speech_to_text(audio: UploadFile = File(...)):
    """
    Accepts an audio file (e.g. webm/ogg/mp3) and returns the transcription.
    """
    try:
        content = await audio.read()
        text = await transcribe_audio(content, audio.content_type or "audio/webm")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return STTResponse(text=text)


@router.post("/tts")
async def text_to_speech(req: TTSRequest):
    """
    Accepts text, returns an audio stream (mp3).
    """
    try:
        audio_bytes = await synthesize_speech(req.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return StreamingResponse(
        content=iter([audio_bytes]),
        media_type="audio/mpeg",
        headers={"Content-Disposition": 'inline; filename="speech.mp3"'},
    )
