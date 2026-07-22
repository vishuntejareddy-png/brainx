from app.services.chunker import chunk_document

# Create a mock string of exactly 5799 characters
mock_text = "A" * 5799

print("Running test...")
chunk_document(mock_text, "test.pdf", chunk_size=900, overlap=100)
