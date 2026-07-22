import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def chunk_document(text: str, filename: str, chunk_size: int = 900, overlap: int = 100) -> dict:
    """
    Splits extracted document text into overlapping chunks for embedding.
    Uses a simple, predictable sliding-window algorithm.

    Args:
        text:       The full extracted document text.
        filename:   The filename (used for logging and chunk metadata).
        chunk_size: Maximum characters per chunk. Default 900.
        overlap:    Characters of overlap between consecutive chunks. Default 100.

    Returns:
        Structured dict with success, chunks list, summary metadata, and error.
    """
    logger.info(f"Starting chunking for '{filename}' | chunk_size={chunk_size} | overlap={overlap}")

    if not text or not text.strip():
        logger.warning(f"Empty document provided for chunking: {filename}")
        return {
            "success": False,
            "chunks": [],
            "metadata": {},
            "error": "Document contains no text."
        }

    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = min(start + chunk_size, text_length)
        chunk_text = text[start:end].strip()
        chunk_len = len(chunk_text)

        if chunk_text:
            chunk_id = len(chunks) + 1
            chunks.append({
                "chunk_id": chunk_id,
                "text": chunk_text,
                "start_char": start,
                "end_char": end,
                "metadata": {
                    "filename": filename,
                    "chunk_index": chunk_id,
                    # total_chunks injected after the loop
                }
            })

            preview_start = chunk_text[:50].replace('\n', ' ')
            preview_end = chunk_text[-50:].replace('\n', ' ') if chunk_len > 50 else ""
            logger.info(
                f"\nChunk {chunk_id}"
                f"\n  Start:  {start}"
                f"\n  End:    {end}"
                f"\n  Length: {chunk_len}"
                f"\n  Head:   \"{preview_start}...\""
                f"\n  Tail:   \"...{preview_end}\""
            )

        # Simple sliding window — advance by (chunk_size - overlap)
        start = end - overlap

        # Critical: break once we've processed all the way to the end of the document
        if end >= text_length:
            break

    # Inject total_chunks into every chunk's metadata
    total_chunks = len(chunks)
    for c in chunks:
        c["metadata"]["total_chunks"] = total_chunks

    # Document statistics summary
    effective_step = chunk_size - overlap
    expected_chunks = max(1, ((text_length - overlap) // effective_step) + 1)
    logger.info(
        f"\n--- Chunking Summary ---"
        f"\n  Document length:    {text_length} chars"
        f"\n  Chunk size:         {chunk_size}"
        f"\n  Overlap:            {overlap}"
        f"\n  Effective step:     {effective_step}"
        f"\n  Expected chunks:    ~{expected_chunks}"
        f"\n  Actual chunks:      {total_chunks}"
        f"\n------------------------"
    )

    return {
        "success": True,
        "chunks": chunks,
        "metadata": {
            "total_chunks": total_chunks,
            "chunk_size": chunk_size,
            "overlap": overlap,
            "effective_step": effective_step,
        },
        "error": None
    }
