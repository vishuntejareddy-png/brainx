import os
import logging
import pandas as pd
from pypdf import PdfReader
import docx
from datetime import datetime

# Configure basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def extract_text(file_path: str) -> dict:
    """
    Automatically detects file type and extracts plain text.
    Returns a structured dictionary with success, text, metadata, and error.
    """
    filename = os.path.basename(file_path)
    
    if not os.path.exists(file_path):
        logger.error(f"File not found: {file_path}")
        return {
            "success": False,
            "text": None,
            "metadata": None,
            "error": "File not found."
        }

    ext = os.path.splitext(file_path)[1].lower().replace(".", "")
    text = ""
    pages = None
    parser_used = ""

    try:
        if ext == "pdf":
            logger.info(f"Parsing PDF: {filename}")
            parser_used = "PyPDF"
            reader = PdfReader(file_path)
            pages = len(reader.pages)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
                    
        elif ext == "docx":
            logger.info(f"Parsing DOCX: {filename}")
            parser_used = "python-docx"
            doc = docx.Document(file_path)
            for para in doc.paragraphs:
                if para.text.strip():
                    text += para.text + "\n\n"
                    
        elif ext == "txt":
            logger.info(f"Parsing TXT: {filename}")
            parser_used = "Standard IO"
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
                
        elif ext in ["csv", "xlsx"]:
            logger.info(f"Parsing Spreadsheet ({ext}): {filename}")
            parser_used = "pandas"
            if ext == "csv":
                df = pd.read_csv(file_path)
            else:
                df = pd.read_excel(file_path, engine="openpyxl")
            # Convert tabular data into a readable text format for the LLM
            text = df.to_string(index=False)
            
        else:
            logger.warning(f"Unsupported file type attempted: {ext}")
            return {
                "success": False,
                "text": None,
                "metadata": None,
                "error": f"Unsupported file type: {ext}"
            }

        # Clean up whitespace and check if empty
        text = text.strip()
        if not text:
            logger.warning(f"Parsed successfully, but document is empty: {filename}")
            return {
                "success": False,
                "text": None,
                "metadata": None,
                "error": "Document contains no readable text."
            }
            
        char_count = len(text)
        logger.info(f"Successfully extracted {char_count} characters from {filename}")
        
        metadata = {
            "filename": filename,
            "file_type": ext,
            "parser": parser_used,
            "characters": char_count,
            "parsed_at": datetime.now().isoformat()
        }
        if pages is not None:
            metadata["pages"] = pages

        return {
            "success": True,
            "text": text,
            "metadata": metadata,
            "error": None
        }

    except Exception as e:
        logger.error(f"Failed to parse {filename}: {str(e)}")
        return {
            "success": False,
            "text": None,
            "metadata": None,
            "error": f"Unable to parse document: {str(e)}"
        }
