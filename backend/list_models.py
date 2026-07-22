# -*- coding: utf-8 -*-
"""
List all available Gemini models for the current API key.
Run: .\.venv\Scripts\python.exe list_models.py
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

import os
from dotenv import load_dotenv
load_dotenv()

from google import genai

API_KEY = os.getenv("GEMINI_API_KEY", "")

# Try v1 first, then v1beta
for version in ["v1", "v1beta"]:
    print(f"\n--- Models available on API version: {version} ---")
    try:
        client = genai.Client(
            api_key=API_KEY,
            http_options={"api_version": version}
        )
        models = client.models.list()
        embedding_models = []
        for m in models:
            print(f"  {m.name}")
            if "embed" in m.name.lower():
                embedding_models.append(m.name)

        print(f"\nEmbedding-capable models on {version}:")
        for em in embedding_models:
            print(f"  --> {em}")

    except Exception as e:
        print(f"  ERROR on {version}: {e}")

print("\nDone.")
