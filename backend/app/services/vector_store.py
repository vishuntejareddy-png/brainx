import logging
import chromadb
from chromadb.config import Settings as ChromaSettings

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Persist ChromaDB to disk inside the backend folder
CHROMA_PERSIST_DIR = "chroma_db"
COLLECTION_NAME = "industrial_brain_documents"

# Singleton client — reused across requests
_client: chromadb.PersistentClient | None = None
_collection = None


def _get_collection():
    """
    Returns the ChromaDB collection, creating it if it does not exist.
    Reuses the singleton client across calls.
    """
    global _client, _collection

    if _collection is not None:
        return _collection

    logger.info(f"Initialising ChromaDB | persist_dir='{CHROMA_PERSIST_DIR}' | collection='{COLLECTION_NAME}'")
    _client = chromadb.PersistentClient(
        path=CHROMA_PERSIST_DIR,
        settings=ChromaSettings(anonymized_telemetry=False)
    )
    _collection = _client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}   # cosine similarity for semantic search
    )
    logger.info(f"Collection ready. Existing documents: {_collection.count()}")
    return _collection


def store_embeddings(embedding_data: dict) -> dict:
    """
    Persists embedding vectors, original chunk text, and metadata in ChromaDB.

    Uses deterministic document IDs (filename + chunk_id) so that re-uploading
    the same document updates existing entries instead of creating duplicates.

    Single responsibility: STORE ONLY.
    No retrieval, no similarity search, no Gemini calls.

    Args:
        embedding_data: The dict returned by generate_embeddings_for_chunks().
                        Must have success=True and a non-empty 'embeddings' list.

    Returns:
        Structured dict with success, storage statistics, and error.
    """
    if not embedding_data.get("success", False) or not embedding_data.get("embeddings"):
        error_msg = embedding_data.get("error") or "No embeddings available to store."
        logger.warning(f"Invalid embedding data passed to vector store: {error_msg}")
        return {
            "success": False,
            "statistics": {
                "documents_stored": 0,
                "collection_name": COLLECTION_NAME
            },
            "error": error_msg
        }

    embeddings = embedding_data["embeddings"]
    total = len(embeddings)
    logger.info(f"Storing {total} embeddings into collection '{COLLECTION_NAME}'...")

    try:
        collection = _get_collection()

        # Build batch lists — ChromaDB upsert is atomic per batch
        ids = []
        vectors = []
        documents = []
        metadatas = []

        for item in embeddings:
            filename = item["metadata"].get("filename", "unknown")
            chunk_id = item["chunk_id"]

            # Deterministic ID: repeated uploads overwrite, never duplicate
            doc_id = f"{filename}__chunk_{chunk_id}"

            ids.append(doc_id)
            vectors.append(item["embedding"])
            documents.append(item["text"])        # original chunk text
            metadatas.append(item["metadata"])    # filename, chunk_index, total_chunks, start_char, end_char

        # upsert = insert new OR update existing — idempotent
        collection.upsert(
            ids=ids,
            embeddings=vectors,
            documents=documents,
            metadatas=metadatas
        )

        stored_count = len(ids)
        total_in_collection = collection.count()
        logger.info(
            f"Upsert complete. "
            f"Stored: {stored_count} | "
            f"Total documents in collection: {total_in_collection}"
        )

        return {
            "success": True,
            "statistics": {
                "documents_stored": stored_count,
                "collection_name": COLLECTION_NAME,
                "total_in_collection": total_in_collection,
                "ids": ids
            },
            "error": None
        }

    except Exception as e:
        logger.error(f"ChromaDB storage failed: {str(e)}")
        return {
            "success": False,
            "statistics": {
                "documents_stored": 0,
                "collection_name": COLLECTION_NAME
            },
            "error": f"ChromaDB storage failed: {str(e)}"
        }
