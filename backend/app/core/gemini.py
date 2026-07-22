import google.generativeai as genai
from app.core.config import settings

# Configure Gemini once. This will be imported and reused everywhere else.
genai.configure(api_key=settings.GEMINI_API_KEY)

# We will initialize specific models (embeddings vs text generation) inside the services.
