# -*- coding: utf-8 -*-
"""
Phase 8 Verification Script -- Answer Generator
Run from: f:\\brainxai\\backend
Command:  .\\.venv\\Scripts\\python.exe test_generator.py
"""

import sys
sys.stdout.reconfigure(encoding='utf-8')

from app.services.retriever import retrieve_relevant_chunks
from app.services.generator import generate_grounded_answer


def test():
    print("\n" + "=" * 65)
    print("   Industrial Brain AI -- Phase 8 Generator Test")
    print("=" * 65)

    # Test Case 1: Answerable Query
    q1 = "Why did Pump-23 fail?"
    print(f"\n[Test 1] Query: '{q1}'")
    print("  Step 1: Retrieving relevant context...")
    ret_1 = retrieve_relevant_chunks(query=q1, top_k=8)

    print("  Step 2: Generating grounded answer with Gemini...")
    gen_1 = generate_grounded_answer(retrieval_output=ret_1)

    print(f"\n  Success  : {gen_1['success']}")
    print(f"  Model    : {gen_1['statistics']['model']}")
    print(f"  Gen Time : {gen_1['statistics']['generation_time_ms']} ms")
    print(f"\n  AI ANSWER:\n  {gen_1['answer']}")
    print("\n  CITATIONS / SOURCES USED:")
    for s in gen_1["sources"]:
        print(f"    - File: {s['filename']} | Chunk ID: {s['chunk_id']} | Rank: {s['rank']}")

    # Test Case 2: Unanswerable Query (Hallucination Prevention Check)
    q2 = "What is the warranty period of Pump-23?"
    print(f"\n" + "-" * 65)
    print(f"[Test 2 - Grounding Check] Query: '{q2}'")
    ret_2 = retrieve_relevant_chunks(query=q2, top_k=5)
    gen_2 = generate_grounded_answer(retrieval_output=ret_2)

    print(f"\n  AI ANSWER:\n  {gen_2['answer']}")
    print("\n" + "=" * 65)
    print("   Phase 8 Generator Test Complete")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    test()
