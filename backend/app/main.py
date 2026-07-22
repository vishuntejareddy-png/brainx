from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import health, upload, retrieve, copilot, telemetry

app = FastAPI(title="Industrial Brain AI")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes with /api prefix and root endpoints
app.include_router(health.router, tags=["Health"])
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(upload.router, tags=["Upload"])
app.include_router(retrieve.router, prefix="/api", tags=["Retrieval"])
app.include_router(retrieve.router, tags=["Retrieval"])
app.include_router(copilot.router, prefix="/api", tags=["Copilot"])
app.include_router(copilot.router, tags=["Copilot"])
app.include_router(telemetry.router, prefix="/api", tags=["Telemetry"])


@app.get("/")
def read_root():
    return {"status": "Industrial Brain AI Backend Active"}
