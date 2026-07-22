import os
import uuid
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Request
from app.services.parser import extract_text
from app.services.chunker import chunk_document
from app.services.embedder import generate_embeddings_for_chunks
from app.services.vector_store import store_embeddings

router = APIRouter()

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".csv", ".xlsx"}
MAX_FILE_SIZE_MB = 50
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024


@router.post("/upload")
async def upload_document(request: Request, file: UploadFile = File(...)):
    if not file or not file.filename:
        return {"success": False, "message": "No file uploaded."}

    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return {
            "success": False,
            "message": f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        }

    content_length = request.headers.get('content-length')
    if content_length and int(content_length) > MAX_FILE_SIZE_BYTES:
        return {"success": False, "message": "Maximum upload size exceeded (50 MB)."}

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = uuid.uuid4().hex[:6]
    safe_original_name = filename.replace(" ", "_")
    stored_filename = f"{timestamp}_{unique_id}_{safe_original_name}"
    file_path = os.path.join(UPLOAD_DIR, stored_filename)

    actual_size = 0
    try:
        with open(file_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):
                actual_size += len(chunk)
                if actual_size > MAX_FILE_SIZE_BYTES:
                    buffer.close()
                    os.remove(file_path)
                    return {"success": False, "message": "Maximum upload size exceeded (50 MB)."}
                buffer.write(chunk)
    except Exception as e:
        return {"success": False, "message": f"Upload failed: {str(e)}"}
    finally:
        await file.close()

    # --- PHASE 3: PARSE ---
    parser_result = extract_text(file_path)
    if not parser_result["success"]:
        return {"success": False, "message": parser_result["error"]}

    extracted_text = parser_result["text"]
    char_count = parser_result["metadata"]["characters"]

    # --- PHASE 4: CHUNK ---
    chunking_result = chunk_document(text=extracted_text, filename=stored_filename)
    if not chunking_result["success"]:
        return {"success": False, "message": chunking_result["error"]}

    # --- PHASE 5: EMBED ---
    embedding_result = generate_embeddings_for_chunks(chunking_result)
    if not embedding_result["success"]:
        return {"success": False, "message": embedding_result["error"]}

    # --- PHASE 6: STORE IN CHROMADB ---
    storage_result = store_embeddings(embedding_result)
    if not storage_result["success"]:
        return {"success": False, "message": storage_result["error"]}

    # --- PHASE 7: RECORD TELEMETRY ---
    try:
        import json
        DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data"))
        DOCS_FILE = os.path.join(DATA_DIR, "documents.json")
        docs = []
        if os.path.exists(DOCS_FILE):
            with open(DOCS_FILE, "r", encoding="utf-8") as f:
                docs = json.load(f)
        
        docs.append({
            "filename": filename,
            "stored_filename": stored_filename,
            "size": actual_size,
            "uploaded_at": datetime.now().isoformat(),
            "chunks": chunking_result["metadata"]["total_chunks"],
            "status": "Indexed"
        })
        
        with open(DOCS_FILE, "w", encoding="utf-8") as f:
            json.dump(docs, f, indent=2)
    except Exception as e:
        print(f"Failed to record telemetry for {filename}: {str(e)}")

    return {
        "success": True,
        "message": "File uploaded, parsed, chunked, embedded, and stored successfully.",
        "upload": {
            "original_filename": filename,
            "stored_filename": stored_filename,
            "extension": ext.replace(".", ""),
            "size": actual_size,
            "mime_type": file.content_type,
            "upload_time": datetime.now().isoformat()
        },
        "parser": {
            "characters_extracted": char_count,
            "metadata": parser_result["metadata"]
        },
        "chunker": {
            "total_chunks": chunking_result["metadata"]["total_chunks"],
            "chunk_size": chunking_result["metadata"]["chunk_size"]
        },
        "embedder": {
            "embeddings_generated": embedding_result["statistics"]["embeddings_generated"],
            "model": embedding_result["statistics"]["model"]
        },
        "vector_store": {
            "documents_stored": storage_result["statistics"]["documents_stored"],
            "collection": storage_result["statistics"]["collection_name"],
            "total_in_collection": storage_result["statistics"]["total_in_collection"]
        }
    }
