from .openai_client import get_client
from ..utils.config import get_settings

settings = get_settings()


async def synthesize_speech(text: str) -> bytes:
    """
    Use OpenAI TTS to turn text into speech.
    """
    try:
        client = get_client()
        response = client.audio.speech.create(
            model=settings.openai_model_tts,
            voice="alloy",
            input=text,
        )

        # New SDK returns bytes directly
        if isinstance(response, bytes):
            audio_bytes = response
        else:
            # Fallback for different SDK versions
            audio_bytes = response.read() if hasattr(response, 'read') else response.content
        
        return audio_bytes
    except Exception as e:
        print(f"TTS Error: {e}")
        raise
