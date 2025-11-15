from ..utils.config import get_settings
from ..utils.audio import detect_audio_format_from_mime, bytes_to_fileobj
from .openai_client import get_client

settings = get_settings()


async def transcribe_audio(audio_bytes: bytes, mime_type: str) -> str:
    """
    Use OpenAI STT (Whisper) to transcribe audio.
    """
    try:
        client = get_client()
        ext, _ = detect_audio_format_from_mime(mime_type)
        file_obj = bytes_to_fileobj(audio_bytes, f"audio.{ext}")

        # Using the OpenAI client - pass file as a simple file object
        transcript = client.audio.transcriptions.create(
            model=settings.openai_model_stt,
            file=file_obj,
            language="en",
        )

        # Get the text from transcript
        result = transcript.text if hasattr(transcript, 'text') else str(transcript)
        return result
    except Exception as e:
        error_msg = f"STT Error: {str(e)}"
        print(error_msg)
        import traceback
        traceback.print_exc()
        raise Exception(error_msg)
