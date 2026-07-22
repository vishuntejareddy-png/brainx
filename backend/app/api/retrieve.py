from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.retriever import retrieve_relevant_chunks

router = APIRouter()


class QueryRequest(BaseModel):
    query: str
    top_k: Optional[int] = 8


@router.post("/retrieve")
async def retrieve_chunks(request: QueryRequest):
    """
    Phase 7 — Semantic Retrieval Endpoint.
    Accepts a natural language query, generates query embedding via Gemini,
    performs cosine similarity search in ChromaDB, and returns top-k most relevant chunks.
    """
    return retrieve_relevant_chunks(query=request.query, top_k=request.top_k or 8)
