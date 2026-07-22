import sys
sys.stdout.reconfigure(encoding='utf-8')

import os
from dotenv import load_dotenv
load_dotenv()

from google import genai
from google.genai import types

API_KEY = os.getenv("GEMINI_API_KEY", "")

candidates = [
    ("text-embedding-004", "v1"),
    ("text-embedding-004", "v1beta"),
    ("gemini-embedding-001", "v1"),
    ("gemini-embedding-001", "v1beta"),
    ("gemini-embedding-2", "v1"),
    ("gemini-embedding-2", "v1beta"),
    ("text-embedding-005", "v1beta"),
]

test_content = "Centrifugal Water Pump-23 bearing replacement schedule."

for model_name, api_ver in candidates:
    print(f"\nTesting model '{model_name}' on api_version '{api_ver}'...")
    try:
        client = genai.Client(
            api_key=API_KEY,
            http_options={"api_version": api_ver}
        )
        response = client.models.embed_content(
            model=model_name,
            contents=test_content,
            config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT")
        )
        vec = response.embeddings[0].values
        print(f"  [SUCCESS] Vector generated! Dimension = {len(vec)}")
    except Exception as e:
        print(f"  [FAIL] {e}")

