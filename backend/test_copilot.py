# -*- coding: utf-8 -*-
"""
Phase 9 Verification Script — Copilot Orchestrator
Run from: f:\\brainxai\\backend
Command:  .\\.venv\\Scripts\\python.exe test_copilot.py
"""
import sys
import json
import time
sys.stdout.reconfigure(encoding='utf-8')

import requests

BASE_URL = "http://localhost:8000"


def post_copilot(query: str, top_k: int = 8) -> dict:
    r = requests.post(
        f"{BASE_URL}/api/copilot",
        json={"query": query, "top_k": top_k},
        timeout=60
    )
    return r.status_code, r.json()


def divider(title=""):
    print("\n" + "=" * 65)
    if title:
        print(f"   {title}")
        print("=" * 65)


def run_tests():
    divider("Industrial Brain AI — Phase 9 Copilot API Tests")

    # ── Test 1: Valid answerable query ──────────────────────────────
    divider("Test 1: Valid Query — 'Why did Pump-23 fail?'")
    status, res = post_copilot("Why did Pump-23 fail?")
    print(f"  HTTP Status : {status}")
    print(f"  Success     : {res.get('success')}")
    print(f"  Model       : {res.get('statistics', {}).get('generation_model')}")
    print(f"  Retrieval   : {res.get('statistics', {}).get('retrieval_time_ms')} ms")
    print(f"  Generation  : {res.get('statistics', {}).get('generation_time_ms')} ms")
    print(f"  Total       : {res.get('statistics', {}).get('total_time_ms')} ms")
    print(f"\n  ANSWER:\n  {res.get('answer')}")
    print(f"\n  SOURCES ({len(res.get('sources', []))} cited):")
    for s in res.get("sources", []):
        print(f"    - {s.get('filename')} | Chunk {s.get('chunk_id')}")

    # ── Test 2: Hallucination prevention ────────────────────────────
    divider("Test 2: Unanswerable Query — 'What is the warranty period?'")
    status, res = post_copilot("What is the warranty period of Pump-23?")
    print(f"  HTTP Status : {status}")
    print(f"  Success     : {res.get('success')}")
    print(f"  ANSWER:\n  {res.get('answer')}")

    # ── Test 3: Empty query validation ──────────────────────────────
    divider("Test 3: Empty Query Validation")
    r = requests.post(f"{BASE_URL}/api/copilot", json={"query": ""}, timeout=10)
    print(f"  HTTP Status : {r.status_code}  (expected 422)")
    print(f"  Error Body  : {json.dumps(r.json(), indent=2)[:300]}")

    # ── Test 4: Long engineering query ──────────────────────────────
    divider("Test 4: Long Query Robustness")
    long_q = (
        "Given the multiple recent incidents logged for Pump-23 involving high vibration alarms, "
        "blocked suction filters, motor overheating, and cooling fan obstruction, can you provide "
        "a comprehensive root cause analysis and recommended preventive maintenance schedule based "
        "on the uploaded operational manuals and inspection reports?"
    )
    status, res = post_copilot(long_q)
    print(f"  HTTP Status : {status}")
    print(f"  Success     : {res.get('success')}")
    print(f"  Answer len  : {len(res.get('answer') or '')} chars")
    print(f"  Total time  : {res.get('statistics', {}).get('total_time_ms')} ms")

    divider("Phase 9 Tests Complete")


if __name__ == "__main__":
    print("\nChecking server health...")
    try:
        r = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"  Server: UP ({r.status_code})")
    except Exception as e:
        print(f"  [ERROR] Server not reachable: {e}")
        print("  Start with: uvicorn app.main:app --reload")
        sys.exit(1)

    run_tests()
