import sys
sys.stdout.reconfigure(encoding='utf-8')

from app.services.chunker import chunk_document
from app.services.embedder import generate_embeddings_for_chunks

test_text = """
INDUSTRIAL PUMP-23 MAINTENANCE MANUAL
Equipment: Centrifugal Water Pump-23
Model: CWP-9000-X
Location: Plant Floor - Sector 4B

1. SAFETY PROCEDURES
Before performing any service or inspection on Centrifugal Water Pump-23, operators must strictly follow Lockout/Tagout (LOTO) protocols. Ensure main electrical circuit breaker CB-402 is locked in the OFF position. Relieve all hydraulic pressure from primary intake line PL-12 prior to unbolting housing flanges.

2. BEARING REPLACEMENT SCHEDULE
Primary drive shaft bearings (Part #BRG-8841-B) require inspection every 1,000 operational hours and mandatory replacement every 4,000 hours. Failure to replace bearings on schedule may lead to shaft misalignment, excessive vibration exceeding 4.5 mm/s RMS, and mechanical seal rupture.

3. FAILURE INCIDENT REPORT - PUMP-23 (2025-11-14)
On November 14, 2025, Pump-23 experienced catastrophic shutoff due to overheating in bearing housing B. Post-incident root cause analysis revealed grease degradation resulting from water ingress through degraded lip seal LS-09.
"""

print("1. Chunking test document...")
chunking_res = chunk_document(test_text, "Pump-23_Manual.txt")
print(f"Chunking success: {chunking_res['success']}, total chunks: {chunking_res['metadata']['total_chunks']}")

print("\n2. Testing embedding generation...")
embed_res = generate_embeddings_for_chunks(chunking_res)
print(f"Embedding success: {embed_res['success']}")
if embed_res['success']:
    print(f"Generated {embed_res['statistics']['embeddings_generated']} embeddings.")
    print(f"Sample embedding vector dim: {len(embed_res['embeddings'][0]['embedding'])}")
    print(f"Sample metadata: {embed_res['embeddings'][0]['metadata']}")
else:
    print(f"ERROR: {embed_res['error']}")
