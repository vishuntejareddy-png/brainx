import logging
import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator
from typing import Optional

from app.services.retriever import retrieve_relevant_chunks, EMBEDDING_MODEL
from app.services.generator import generate_grounded_answer, GENERATION_MODELS

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

router = APIRouter()

MAX_QUERY_LENGTH = 2000
DEFAULT_TOP_K = 8


class CopilotRequest(BaseModel):
    query: str
    top_k: Optional[int] = DEFAULT_TOP_K

    @field_validator("query")
    @classmethod
    def query_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Query cannot be empty.")
        if len(v.strip()) > MAX_QUERY_LENGTH:
            raise ValueError(f"Query too long. Maximum {MAX_QUERY_LENGTH} characters allowed.")
        return v.strip()


class CopilotResponse(BaseModel):
    success: bool
    query: str
    answer: Optional[str]
    sources: list
    statistics: dict
    error: Optional[str]


@router.post("/copilot", response_model=CopilotResponse)
async def ask_copilot(request: CopilotRequest):
    """
    Phase 9 — Knowledge Copilot RAG Orchestrator.

    Thin coordination layer. Delegates all business logic to services:
      - retriever.py  → semantic search (ChromaDB + Gemini embeddings)
      - generator.py  → grounded answer generation (Gemini LLM)

    This endpoint has NO retrieval, embedding, vector DB, or prompt logic.
    It receives a question and returns a grounded answer with citations.
    """
    total_start = time.perf_counter()
    query = request.query
    top_k = request.top_k or DEFAULT_TOP_K

    logger.info(f"═══ Copilot request received | query='{query[:80]}' | top_k={top_k}")

    # ─── STEP 1: RETRIEVE relevant document chunks ───────────────────────────
    logger.info("Step 1/2 — Running semantic retrieval...")
    retrieval_start = time.perf_counter()

    try:
        retrieval_result = retrieve_relevant_chunks(query=query, top_k=top_k)
    except Exception as exc:
        logger.error(f"Unexpected retrieval exception: {exc}", exc_info=True)
        return CopilotResponse(
            success=False,
            query=query,
            answer=None,
            sources=[],
            statistics={"total_time_ms": _elapsed_ms(total_start)},
            error="Internal server error during retrieval."
        )

    retrieval_ms = _elapsed_ms(retrieval_start)

    if not retrieval_result.get("success", False):
        logger.warning(f"Retrieval failed: {retrieval_result.get('error')}")
        return CopilotResponse(
            success=False,
            query=query,
            answer=None,
            sources=[],
            statistics={"retrieval_time_ms": retrieval_ms, "total_time_ms": _elapsed_ms(total_start)},
            error=retrieval_result.get("error", "Retrieval failed.")
        )

    retrieved_chunks = retrieval_result.get("results", [])
    retrieved_count = len(retrieved_chunks)
    logger.info(f"Retrieval complete — {retrieved_count} chunks returned in {retrieval_ms}ms")

    # ─── STEP 2: Short-circuit if no context was found ───────────────────────
    if retrieved_count == 0:
        logger.info("No context found in knowledge base — skipping generation.")
        return CopilotResponse(
            success=True,
            query=query,
            answer="I couldn't find relevant information in the uploaded documents. Please upload relevant engineering documents and try again.",
            sources=[],
            statistics={
                "retrieved_chunks": 0,
                "retrieval_time_ms": retrieval_ms,
                "generation_time_ms": 0,
                "total_time_ms": _elapsed_ms(total_start),
                "embedding_model": EMBEDDING_MODEL,
                "generation_model": None
            },
            error=None
        )

    # ─── STEP 3: GENERATE grounded answer ────────────────────────────────────
    logger.info(f"Step 2/2 — Starting answer generation with {retrieved_count} context chunks...")
    generation_start = time.perf_counter()

    try:
        generation_result = generate_grounded_answer(retrieval_output=retrieval_result)
    except Exception as exc:
        logger.error(f"Unexpected generation exception: {exc}", exc_info=True)
        return CopilotResponse(
            success=False,
            query=query,
            answer=None,
            sources=[],
            statistics={
                "retrieved_chunks": retrieved_count,
                "retrieval_time_ms": retrieval_ms,
                "total_time_ms": _elapsed_ms(total_start),
                "embedding_model": EMBEDDING_MODEL,
            },
            error="Internal server error during answer generation."
        )

    generation_ms = _elapsed_ms(generation_start)
    total_ms = _elapsed_ms(total_start)

    if not generation_result.get("success", False):
        logger.warning(f"Generation failed: {generation_result.get('error')}")
        return CopilotResponse(
            success=False,
            query=query,
            answer=None,
            sources=generation_result.get("sources", []),
            statistics={
                "retrieved_chunks": retrieved_count,
                "retrieval_time_ms": retrieval_ms,
                "generation_time_ms": generation_ms,
                "total_time_ms": total_ms,
                "embedding_model": EMBEDDING_MODEL,
                "generation_model": GENERATION_MODELS[0]
            },
            error=generation_result.get("error", "Answer generation failed.")
        )

    used_model = generation_result.get("statistics", {}).get("model", GENERATION_MODELS[0])
    logger.info(
        f"═══ Copilot response complete | "
        f"model={used_model} | "
        f"retrieval={retrieval_ms}ms | "
        f"generation={generation_ms}ms | "
        f"total={total_ms}ms"
    )

    stats_dict = {
        "retrieved_chunks": retrieved_count,
        "retrieval_time_ms": retrieval_ms,
        "generation_time_ms": generation_ms,
        "total_time_ms": total_ms,
        "embedding_model": EMBEDDING_MODEL,
        "generation_model": used_model
    }

    # --- RECORD TELEMETRY ---
    try:
        import os, json
        from datetime import datetime
        DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data"))
        ANALYTICS_FILE = os.path.join(DATA_DIR, "analytics.json")
        data = {"queries": []}
        if os.path.exists(ANALYTICS_FILE):
            with open(ANALYTICS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
        data["queries"].append({
            "timestamp": datetime.now().isoformat(),
            **stats_dict
        })
        with open(ANALYTICS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        logger.error(f"Failed to record analytics telemetry: {str(e)}")

    return CopilotResponse(
        success=True,
        query=query,
        answer=generation_result.get("answer"),
        sources=generation_result.get("sources", []),
        statistics=stats_dict,
        error=None
    )


def _elapsed_ms(start: float) -> float:
    return round((time.perf_counter() - start) * 1000, 2)
