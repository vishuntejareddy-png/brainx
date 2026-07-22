import logging
import time
from google import genai
from google.genai import types
from app.core.config import settings

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# AQ. key type requires v1 — the SDK defaults to v1beta which rejects this key
_client = genai.Client(
    api_key=settings.GEMINI_API_KEY,
    http_options={"api_version": "v1"}
)

EMBEDDING_MODEL = "gemini-embedding-001"


def generate_embeddings_for_chunks(chunk_data: dict) -> dict:
    """
    Accepts the structured output from chunker.py and generates
    one vector embedding per chunk using Google's text-embedding-004 model.

    Uses the new `google-genai` SDK (google.generativeai is deprecated).

    Args:
        chunk_data: The dict returned by chunk_document() — must have
                    success=True and a non-empty 'chunks' list.

    Returns:
        Structured dict with success, embeddings list, statistics, and error.
    """
    if not chunk_data.get("success", False) or not chunk_data.get("chunks"):
        error_msg = chunk_data.get("error") or "No chunks available to embed."
        logger.warning(f"Invalid or empty chunk data provided to embedder: {error_msg}")
        return {
            "success": False,
            "embeddings": [],
            "statistics": {
                "total_chunks": 0,
                "embeddings_generated": 0,
                "model": EMBEDDING_MODEL
            },
            "error": error_msg
        }

    chunks = chunk_data["chunks"]
    total_chunks = len(chunks)
    embeddings_list = []

    logger.info(f"Starting embedding generation for {total_chunks} chunks | model: {EMBEDDING_MODEL}")

    try:
        for idx, chunk in enumerate(chunks, 1):
            chunk_text = chunk["text"]
            t0 = time.perf_counter()
            logger.info(f"Embedding chunk {idx}/{total_chunks} (chars: {len(chunk_text)})")

            response = _client.models.embed_content(
                model=EMBEDDING_MODEL,
                contents=chunk_text,
                config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT")
            )

            vector = response.embeddings[0].values
            embed_ms = round((time.perf_counter() - t0) * 1000, 1)

            if not vector:
                raise ValueError(f"Empty embedding vector returned for chunk_id={chunk['chunk_id']}")

            logger.info(f"  chunk {idx} embedded in {embed_ms}ms | dim={len(vector)}")

            # Consolidate all positional info into metadata for ChromaDB
            enriched_metadata = {
                **chunk["metadata"],
                "start_char": chunk["start_char"],
                "end_char": chunk["end_char"],
            }

            embeddings_list.append({
                "chunk_id": chunk["chunk_id"],
                "embedding": list(vector),   # ensure plain list, not numpy array
                "text": chunk_text,
                "metadata": enriched_metadata
            })

        logger.info(f"Embedding generation complete. {len(embeddings_list)}/{total_chunks} vectors created.")

        return {
            "success": True,
            "embeddings": embeddings_list,
            "statistics": {
                "total_chunks": total_chunks,
                "embeddings_generated": len(embeddings_list),
                "model": EMBEDDING_MODEL
            },
            "error": None
        }

    except Exception as e:
        logger.error(f"Embedding generation failed at chunk {len(embeddings_list) + 1}/{total_chunks}: {str(e)}")
        return {
            "success": False,
            "embeddings": [],
            "statistics": {
                "total_chunks": total_chunks,
                "embeddings_generated": len(embeddings_list),
                "model": EMBEDDING_MODEL
            },
            "error": f"Embedding generation failed: {str(e)}"
        }
