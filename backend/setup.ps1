python -m venv .venv
.\.venv\Scripts\pip.exe install fastapi uvicorn python-multipart python-dotenv google-generativeai chromadb llama-index pypdf python-docx pandas
.\.venv\Scripts\pip.exe freeze > requirements.txt
.\.venv\Scripts\uvicorn.exe app.main:app --reload
