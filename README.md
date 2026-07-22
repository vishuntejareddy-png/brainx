# Industrial Brain AI

> **Hackathon Project** — An enterprise-grade AI-powered Knowledge Copilot for industrial operations. Built with a FastAPI RAG backend and a Next.js frontend.

---

## 🏗️ Architecture

```
Frontend (Next.js 15)          Backend (FastAPI)
┌──────────────────┐           ┌────────────────────────────┐
│  Dashboard       │  REST API │  POST /api/upload           │
│  Documents       │◄─────────►│  POST /api/copilot (RAG)   │
│  Knowledge Base  │           │  GET  /api/documents        │
│  Upload          │           │  GET  /api/dashboard        │
│  Knowledge       │           │  GET  /api/analytics        │
│  Copilot         │           └────────────────────────────┘
│  Analytics       │                      │
└──────────────────┘              ┌───────▼────────┐
                                  │    ChromaDB    │
                                  │  (vector store)│
                                  └───────▲────────┘
                                          │
                              Gemini Embedding API
                              Gemini Flash LLM API
```

## ⚡ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.11+ |
| Vector DB | ChromaDB (local) |
| Embeddings | `gemini-embedding-001` (3072-dim) |
| LLM | `gemini-2.0-flash` / `gemini-2.5-flash-lite` |
| Parsing | PyMuPDF, python-docx, openpyxl |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- A Google Gemini API key

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure API key
echo GEMINI_API_KEY=your_key_here > .env

# Start the server
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**

---

## 🔑 Environment Variables

### `backend/.env`

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 📁 Project Structure

```
brainxai/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── upload.py       # Document ingestion endpoint
│   │   │   ├── copilot.py      # RAG orchestrator (Phase 9)
│   │   │   └── telemetry.py    # Dashboard/analytics/documents APIs
│   │   ├── services/
│   │   │   ├── parser.py       # Multi-format document parser
│   │   │   ├── chunker.py      # Sliding-window chunker
│   │   │   ├── embedder.py     # Gemini embedding service
│   │   │   ├── vector_store.py # ChromaDB client
│   │   │   ├── retriever.py    # Semantic retrieval
│   │   │   └── generator.py    # Grounded answer generation
│   │   └── main.py             # FastAPI app + CORS
│   ├── data/                   # JSON telemetry (auto-created)
│   ├── uploads/                # Uploaded files (auto-created)
│   ├── chroma_db/              # Vector database (auto-created)
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── app/
        │   └── (dashboard)/    # All dashboard pages
        └── components/
            ├── layout/         # Sidebar, Header
            └── shared/         # Reusable components
```

---

## 🧠 How It Works

1. **Upload** — Drop a PDF/DOCX/TXT/CSV/XLSX document
2. **Parse** — Text is extracted using format-specific parsers
3. **Chunk** — Document is split with sliding-window chunking (900 chars, 100 overlap)
4. **Embed** — Each chunk is embedded using `gemini-embedding-001` (3072-dim vectors)
5. **Store** — Vectors are stored in ChromaDB with metadata
6. **Query** — User asks a question via the Knowledge Copilot
7. **Retrieve** — Top-K semantically similar chunks are fetched
8. **Generate** — Gemini LLM generates a grounded answer with citations

---

## 📊 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload and index a document |
| `POST` | `/api/copilot` | Ask a question (RAG) |
| `GET` | `/api/documents` | List all indexed documents |
| `GET` | `/api/dashboard` | Dashboard statistics |
| `GET` | `/api/analytics` | Copilot usage analytics |

---

## 🏆 Hackathon Context

**Industrial Brain AI** demonstrates that RAG (Retrieval-Augmented Generation) can be applied to industrial knowledge management — enabling engineers to instantly query maintenance manuals, SOPs, inspection logs, and incident reports using natural language.

Key differentiators:
- **Real backend** — not a mock or demo. Every query is answered from real indexed documents.
- **Transparent reasoning** — the UI shows each step of the AI pipeline in real time.
- **Production architecture** — Clean Architecture (API → Service → Domain), MVI-ready frontend.
