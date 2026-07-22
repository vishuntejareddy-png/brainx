"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";

export function UploadDropzone() {
  const onDrop = useCallback((_acceptedFiles: File[]) => {
    // Upload is handled by the /upload page directly
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={`rounded-2xl border-2 border-dashed p-16 text-center transition-colors cursor-pointer ${
        isDragActive ? "border-mint/50 bg-mint/[0.03]" : "border-border-hair bg-bg-card"
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <UploadCloud size={32} className="text-zinc-500" />
        <div>
          <p className="text-body text-text-primary">
            Drag & Drop your engineering documents
          </p>
          <p className="text-caption text-zinc-600 mt-1">
            or <span className="text-mint">Browse Files</span>
          </p>
        </div>
        <p className="text-caption font-mono text-zinc-500 mt-2">
          PDF • DOCX • XLSX • CSV • TXT • Images
        </p>
        <p className="text-[10px] text-zinc-600">Maximum file size: 100 MB</p>
      </div>
    </div>
  );
}
