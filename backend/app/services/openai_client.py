from openai import OpenAI

def get_client() -> OpenAI:
    """
    Create a new OpenAI client instance.
    Avoiding global state to prevent initialization issues.
    """
    from ..utils.config import get_settings
    
    _settings = get_settings()
    
    # Use minimal parameters to avoid compatibility issues
    client = OpenAI(api_key=_settings.openai_api_key)
    return client
