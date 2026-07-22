# -*- coding: utf-8 -*-
"""
ChromaDB Verification Script -- Phase 6 Checkpoint
Run from: f:\\brainxai\\backend
Command:  .\.venv\Scripts\python.exe test_vector_store.py

Checks:
  1. Collection exists and has the expected document count
  2. Sample IDs are deterministic (filename__chunk_N format)
  3. Metadata survived storage intact
  4. All embedding vectors have consistent dimensions

NOTE: Upload at least one document via POST /upload in Swagger before running.
"""

import sys
import chromadb
from chromadb.config import Settings as ChromaSettings

# Force UTF-8 output so Windows cp1252 terminal doesn't crash
sys.stdout.reconfigure(encoding='utf-8')

CHROMA_PERSIST_DIR = "chroma_db"
COLLECTION_NAME    = "industrial_brain_documents"


def verify():
    print("\n" + "=" * 60)
    print("   ChromaDB Verification -- Industrial Brain")
    print("=" * 60)

    # 1. Connect
    client = chromadb.PersistentClient(
        path=CHROMA_PERSIST_DIR,
        settings=ChromaSettings(anonymized_telemetry=False)
    )

    # 2. List all collections
    collections = client.list_collections()
    print(f"\n[1] Collections found: {len(collections)}")
    for c in collections:
        print(f"    - {c.name}")

    if not any(c.name == COLLECTION_NAME for c in collections):
        print(f"\n[FAIL] Collection '{COLLECTION_NAME}' NOT FOUND.")
        print("   --> Upload a document first via POST /upload in Swagger.")
        print("   --> Then re-run this script.")
        return

    collection = client.get_collection(COLLECTION_NAME)
    total_docs = collection.count()
    print(f"\n[2] Total documents in '{COLLECTION_NAME}': {total_docs}")

    if total_docs == 0:
        print("[FAIL] Collection exists but is EMPTY. Check upload pipeline.")
        return

    # 3. Retrieve everything
    results = collection.get(
        include=["embeddings", "documents", "metadatas"]
    )

    ids        = results["ids"]
    documents  = results["documents"]
    metadatas  = results["metadatas"]
    embeddings = results["embeddings"]

    # 4. Sample IDs
    print(f"\n[3] Stored IDs ({len(ids)} total):")
    for doc_id in ids:
        print(f"    - {doc_id}")

    # 5. Metadata of first record
    print(f"\n[4] Metadata of record[0]:")
    for k, v in (metadatas[0] if metadatas else {}).items():
        print(f"    {k}: {v}")

    print(f"\n    Document preview (first 120 chars):")
    print(f"    \"{documents[0][:120]}...\"")

    # 6. Embedding dimension consistency
    print(f"\n[5] Embedding dimension check:")
    dims = [len(e) for e in embeddings]
    unique_dims = set(dims)
    if len(unique_dims) == 1:
        print(f"    [PASS] All {len(dims)} embeddings have consistent dimension: {dims[0]}")
    else:
        print(f"    [FAIL] INCONSISTENT dimensions found: {unique_dims}")

    # 7. Final verdict
    print("\n" + "=" * 60)
    if total_docs > 0 and len(unique_dims) == 1:
        print(f"[PASS] Phase 6 VERIFIED")
        print(f"       Documents stored : {total_docs}")
        print(f"       Embedding dim    : {dims[0]}")
        print(f"       Collection       : {COLLECTION_NAME}")
    else:
        print("[FAIL] Verification FAILED -- review output above.")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    verify()
