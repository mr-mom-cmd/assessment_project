import io
from typing import Tuple


def detect_audio_format_from_mime(mime_type: str) -> Tuple[str, str]:
    """
    Return (file_extension, openai_mime_hint) for a given MIME type.
    Just basic handling; you can extend for more formats.
    """
    mime_type = mime_type.lower()

    if "wav" in mime_type:
        return "wav", "audio/wav"
    if "ogg" in mime_type:
        return "ogg", "audio/ogg"
    if "mpeg" in mime_type or "mp3" in mime_type:
        return "mp3", "audio/mpeg"
    if "webm" in mime_type:
        return "webm", "audio/webm"

    # Fallback
    return "webm", mime_type


def bytes_to_fileobj(data: bytes, filename: str) -> io.BytesIO:
    bio = io.BytesIO(data)
    bio.name = filename  # some libs want this
    bio.seek(0)
    return bio
