import logging
import time
from typing import List, Dict, Any
from google import genai
from google.genai import types
from app.core.config import settings

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize client using v1 REST API for compatibility
_client = genai.Client(
    api_key=settings.GEMINI_API_KEY,
    http_options={"api_version": "v1"}
)

GENERATION_MODELS = [
    "gemini-2.0-flash-001",
    "gemini-3.1-flash-lite",
    "gemini-2.5-pro",
    "gemma-4-26b-a4b-it",
    "gemini-3.5-flash"
]

SYSTEM_PROMPT = """You are Industrial Brain AI, an expert Industrial Knowledge Copilot.
Your job is to answer an engineer's technical question based STRICTLY and ONLY on the supplied document context chunks below.

STRICT GROUNDING RULES:
1. Use ONLY the facts provided in the CONTEXT below. Do NOT use outside general knowledge or make assumptions.
2. If the answer cannot be found or deduced from the provided context chunks, explicitly state:
   "I couldn't find this information in the uploaded documents."
3. Never invent maintenance procedures, technical specifications, or fabricate incident history.
4. Maintain a clear, concise, and professional industrial engineering tone.
5. Provide a direct, well-structured answer.
"""


def generate_grounded_answer(retrieval_output: dict) -> dict:
    """
    Takes the output from retriever.py (user query + top retrieved document chunks),
    builds a grounded prompt, calls Gemini, and returns a structured response with
    the grounded AI answer, cited sources, and processing statistics.

    Single responsibility: GROUNDED ANSWER GENERATION ONLY.
    No retrieval, embeddings, ChromaDB operations, or document parsing.
    """
    start_time = time.perf_counter()
    logger.info("Starting answer generation...")

    if not retrieval_output.get("success", False):
        error_msg = retrieval_output.get("error") or "Invalid retrieval output provided to generator."
        logger.warning(f"Answer generation aborted: {error_msg}")
        return {
            "success": False,
            "query": retrieval_output.get("query", ""),
            "answer": None,
            "sources": [],
            "statistics": {
                "retrieved_chunks": 0,
                "model": GENERATION_MODELS[0],
                "generation_time_ms": 0
            },
            "error": error_msg
        }

    query = retrieval_output.get("query", "").strip()
    results = retrieval_output.get("results", [])
    retrieved_count = len(results)

    logger.info(f"Retrieved chunks count: {retrieved_count} | Query: '{query}'")

    if retrieved_count == 0:
        return {
            "success": True,
            "query": query,
            "answer": "I couldn't find this information in the uploaded documents.",
            "sources": [],
            "statistics": {
                "retrieved_chunks": 0,
                "model": GENERATION_MODELS[0],
                "generation_time_ms": 0
            },
            "error": None
        }

    # Extract sources for attribution
    sources = []
    seen_sources = set()
    context_blocks = []

    for item in results:
        meta = item.get("metadata", {})
        filename = meta.get("filename", "Unknown Document")
        chunk_id = meta.get("chunk_id") or meta.get("chunk_index", "N/A")
        rank = item.get("rank", 1)

        source_key = (filename, chunk_id)
        if source_key not in seen_sources:
            seen_sources.add(source_key)
            sources.append({
                "filename": filename,
                "chunk_id": chunk_id,
                "rank": rank
            })

        context_blocks.append(
            f"[Chunk {rank} | Document: {filename} (Chunk ID: {chunk_id})]\n"
            f"{item.get('text', '')}\n"
        )

    full_context = "\n---\n".join(context_blocks)
    user_prompt = f"QUESTION:\n{query}\n\nSUPPLIED CONTEXT:\n{full_context}"
    full_prompt = f"{SYSTEM_PROMPT}\n\n{user_prompt}"

    logger.info(f"Constructed prompt length: {len(full_prompt)} characters")

    # Call Gemini API
    answer_text = None
    used_model = None
    last_error = None

    for model_name in GENERATION_MODELS:
        try:
            logger.info(f"Generating content with model '{model_name}'...")
            t0 = time.perf_counter()
            
            response = _client.models.generate_content(
                model=model_name,
                contents=full_prompt,
                config=types.GenerateContentConfig(
                    temperature=0.2,
                )
            )
            answer_text = response.text
            used_model = model_name
            gen_ms = round((time.perf_counter() - t0) * 1000, 2)
            logger.info(f"Gemini response received from '{used_model}' in {gen_ms}ms")
            break
        except Exception as e:
            logger.warning(f"Generation attempt with '{model_name}' failed: {str(e)}")
            last_error = str(e)
            time.sleep(1)
            continue

    if not answer_text:
        try:
            logger.info("Attempting fallback with legacy google.generativeai SDK...")
            import google.generativeai as legacy_genai
            legacy_genai.configure(api_key=settings.GEMINI_API_KEY)
            model = legacy_genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(full_prompt)
            answer_text = response.text
            used_model = "gemini-1.5-flash (fallback)"
        except Exception as fallback_err:
            logger.error(f"All answer generation attempts failed: {str(fallback_err)}")
            return {
                "success": False,
                "query": query,
                "answer": None,
                "sources": sources,
                "statistics": {
                    "retrieved_chunks": retrieved_count,
                    "model": GENERATION_MODELS[0],
                    "generation_time_ms": 0
                },
                "error": f"Answer generation failed: {last_error or str(fallback_err)}"
            }

    elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
    logger.info(f"Answer generation complete in {elapsed_ms}ms")

    return {
        "success": True,
        "query": query,
        "answer": answer_text.strip(),
        "sources": sources,
        "statistics": {
            "retrieved_chunks": retrieved_count,
            "model": used_model,
            "generation_time_ms": elapsed_ms
        },
        "error": None
    }
