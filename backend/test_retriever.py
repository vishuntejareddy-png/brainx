# -*- coding: utf-8 -*-
"""
Phase 7 Verification Script -- Semantic Retrieval
Run from: f:\\brainxai\\backend
Command:  .\\.venv\\Scripts\\python.exe test_retriever.py
"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

from app.services.retriever import retrieve_relevant_chunks

def test():
    print("\n" + "=" * 60)
    print("   Industrial Brain AI -- Phase 7 Retriever Test")
    print("=" * 60)

    test_query = "Why did Pump-23 fail?"
    print(f"\n[1] Submitting test query: '{test_query}'")

    result = retrieve_relevant_chunks(query=test_query, top_k=8)

    print(f"\n[2] Success: {result['success']}")
    if result["error"]:
        print(f"    Error: {result['error']}")
    
    print(f"    Results Found: {result['statistics']['results_found']}")
    print(f"    Search Time : {result['statistics']['search_time_ms']} ms")

    if result["results"]:
        print("\n[3] Top Chunks Retrieved:")
        for r in result["results"]:
            print(f"\n    Rank {r['rank']} | Score: {r['score']}")
            print(f"    File : {r['metadata'].get('filename')}")
            print(f"    Text : \"{r['text'][:120]}...\"")
    else:
        print("\n    Note: No documents returned (upload documents via /api/upload to index content first).")

    print("\n" + "=" * 60)
    print("   Phase 7 Retriever Test Complete")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    test()
