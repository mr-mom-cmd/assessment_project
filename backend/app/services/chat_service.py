from typing import List
from .openai_client import get_client
from ..models.chat import ChatTurn
from ..utils.config import get_settings

settings = get_settings()


async def generate_reply(message: str, history: List[ChatTurn]) -> str:
    """
    Use OpenAI Chat model to generate a reply.
    """
    client = get_client()

    messages = [{"role": h.role, "content": h.content} for h in history]
    messages.append({"role": "user", "content": message})

    completion = client.chat.completions.create(
        model=settings.openai_model_chat,
        messages=messages,
    )

    reply = completion.choices[0].message.content
    return reply or ""
