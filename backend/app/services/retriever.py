import logging
import time
import chromadb
from chromadb.config import Settings as ChromaSettings
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

EMBEDDING_MODEL = "gemini-embedding-001"
CHROMA_PERSIST_DIR = "chroma_db"
COLLECTION_NAMES = ["industrial_brain_documents", "industrial_docs"]


def retrieve_relevant_chunks(query: str, top_k: int = 8) -> dict:
    """
    Takes a natural language user query, converts it into an embedding vector using Gemini,
    and performs cosine similarity search against stored document vectors in ChromaDB.

    Single responsibility: SEMANTIC SEARCH ONLY.
    No LLM answer generation is performed in Phase 7.
    """
    start_time = time.perf_counter()
    logger.info(f"Received semantic retrieval query: '{query}'")

    if not query or not query.strip():
        return {
            "success": False,
            "query": query,
            "results": [],
            "statistics": {"search_time_ms": 0, "results_found": 0},
            "error": "Query string cannot be empty."
        }

    query = query.strip()

    try:
        # STEP 1: Generate Query Vector Embedding
        logger.info("Generating query vector embedding...")
        t0 = time.perf_counter()
        
        try:
            response = _client.models.embed_content(
                model=EMBEDDING_MODEL,
                contents=query,
                config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY")
            )
            query_vector = list(response.embeddings[0].values)
        except Exception as embed_err:
            logger.warning(f"Primary embed_content attempt failed ({embed_err}). Trying fallback...")
            import google.generativeai as legacy_genai
            legacy_genai.configure(api_key=settings.GEMINI_API_KEY)
            res = legacy_genai.embed_content(
                model="models/text-embedding-004",
                content=query,
                task_type="retrieval_query"
            )
            query_vector = res.get("embedding") if isinstance(res, dict) else res["embedding"]

        if not query_vector:
            raise ValueError("Failed to generate embedding vector for query.")

        embed_ms = round((time.perf_counter() - t0) * 1000, 2)
        logger.info(f"Query vector generated in {embed_ms}ms (dim: {len(query_vector)})")

        # STEP 2: Connect to ChromaDB Vector Database
        chroma_client = chromadb.PersistentClient(
            path=CHROMA_PERSIST_DIR,
            settings=ChromaSettings(anonymized_telemetry=False)
        )

        collection = None
        for coll_name in COLLECTION_NAMES:
            try:
                coll = chroma_client.get_collection(name=coll_name)
                if coll.count() > 0:
                    collection = coll
                    logger.info(f"Connected to populated ChromaDB collection '{coll_name}' ({coll.count()} documents)")
                    break
                elif collection is None:
                    collection = coll
            except Exception:
                continue

        if collection is None or collection.count() == 0:
            logger.error("No populated ChromaDB collection found.")
            return {
                "success": False,
                "query": query,
                "results": [],
                "statistics": {"search_time_ms": 0, "results_found": 0},
                "error": "Knowledge base is empty. Upload documents first."
            }

        effective_top_k = min(top_k, collection.count())
        logger.info(f"Executing similarity search for top {effective_top_k} matches...")
        
        query_results = collection.query(
            query_embeddings=[query_vector],
            n_results=effective_top_k,
            include=["documents", "metadatas", "distances"]
        )

        # STEP 3: Format and Score Results
        formatted_results = []
        documents = query_results.get("documents", [[]])[0]
        metadatas = query_results.get("metadatas", [[]])[0]
        distances = query_results.get("distances", [[]])[0]

        for rank, (doc, meta, dist) in enumerate(zip(documents, metadatas, distances), 1):
            # Convert cosine distance to similarity score in range [0, 1]
            similarity_score = max(0.0, min(1.0, 1.0 - (dist / 2.0))) if dist is not None else 0.0

            formatted_results.append({
                "rank": rank,
                "score": round(similarity_score, 4),
                "text": doc,
                "metadata": {
                    "filename": meta.get("filename") if meta else None,
                    "chunk_id": meta.get("chunk_index") if meta else None,
                    "chunk_index": meta.get("chunk_index") if meta else None,
                    "total_chunks": meta.get("total_chunks") if meta else None,
                    "start_char": meta.get("start_char") if meta else None,
                    "end_char": meta.get("end_char") if meta else None
                }
            })

        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.info(f"Retrieval completed in {elapsed_ms}ms. Found {len(formatted_results)} results.")

        return {
            "success": True,
            "query": query,
            "results": formatted_results,
            "statistics": {
                "search_time_ms": elapsed_ms,
                "results_found": len(formatted_results)
            },
            "error": None
        }

    except Exception as e:
        logger.error(f"Error during retrieval: {str(e)}")
        return {
            "success": False,
            "query": query,
            "results": [],
            "statistics": {"search_time_ms": 0, "results_found": 0},
            "error": f"Retrieval failed: {str(e)}"
        }
