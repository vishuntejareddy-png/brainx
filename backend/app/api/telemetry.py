import os
import json
from fastapi import APIRouter

router = APIRouter()

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data"))
os.makedirs(DATA_DIR, exist_ok=True)

DOCUMENTS_FILE = os.path.join(DATA_DIR, "documents.json")
ANALYTICS_FILE = os.path.join(DATA_DIR, "analytics.json")

def read_json(path, default):
    if not os.path.exists(path):
        return default
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default

@router.get("/documents")
async def get_documents():
    documents = read_json(DOCUMENTS_FILE, [])
    # Sort by uploaded_at descending
    documents.sort(key=lambda x: x.get("uploaded_at", ""), reverse=True)
    return documents

@router.get("/analytics")
async def get_analytics():
    data = read_json(ANALYTICS_FILE, {"queries": []})
    queries = data.get("queries", [])
    total_queries = len(queries)
    
    avg_response_time = 0
    avg_retrieval_time = 0
    avg_generation_time = 0

    if total_queries > 0:
        avg_response_time = sum(q.get("total_time_ms", 0) for q in queries) / total_queries
        avg_retrieval_time = sum(q.get("retrieval_time_ms", 0) for q in queries) / total_queries
        avg_generation_time = sum(q.get("generation_time_ms", 0) for q in queries) / total_queries

    from datetime import datetime, timedelta
    
    queries_today = 0
    today = datetime.now().date()
    for q in queries:
        try:
            q_date = datetime.fromisoformat(q.get("timestamp", "")).date()
            if q_date == today:
                queries_today += 1
        except Exception:
            pass

    return {
        "total_queries": total_queries,
        "queries_today": queries_today,
        "avg_generation_time_ms": avg_generation_time,
        "average_response_time": round(avg_response_time / 1000, 2),
        "average_retrieval_time": round(avg_retrieval_time / 1000, 2),
        "average_generation_time": round(avg_generation_time / 1000, 2),
        "queries": queries
    }

@router.get("/dashboard")
async def get_dashboard():
    # Documents
    documents = read_json(DOCUMENTS_FILE, [])
    total_documents = len(documents)
    total_chunks = sum(doc.get("chunks", 0) for doc in documents)
    last_upload = None
    if documents:
        documents.sort(key=lambda x: x.get("uploaded_at", ""), reverse=True)
        last_upload = documents[0].get("filename")

    # Analytics
    data = read_json(ANALYTICS_FILE, {"queries": []})
    queries = data.get("queries", [])
    total_queries = len(queries)

    return {
        "documents": total_documents,
        "chunks": total_chunks,
        "queries": total_queries,
        "last_upload": last_upload,
        "embedding_model": "gemini-embedding-001",
        "generation_model": "gemini-3.1-flash-lite"
    }
