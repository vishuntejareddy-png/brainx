'use client';

import React, { useState, useRef } from 'react';
import { mutate } from "swr";
import { toast } from "sonner";
import { 
  UploadCloud, FileText, CheckCircle2, X, 
  Sparkles, Database, Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setUploadResult(null);
    setError(null);
    uploadFile(selectedFile);
  };

  const uploadFile = async (selectedFile: File) => {
    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        setUploadResult(data);
        toast.success("Document Indexed", {
          description: `Successfully indexed ${data.chunker.total_chunks} chunks.`
        });
        
        // Invalidate global caches so Dashboard and Documents refresh instantly
        mutate("http://localhost:8000/api/dashboard");
        mutate("http://localhost:8000/api/documents");
      } else {
        setError(data.message || "Upload failed");
      }
    } catch (err) {
      setError("An error occurred during upload");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 min-w-0 h-full bg-[#000000] text-neutral-200 p-8 md:p-10 font-sans overflow-y-auto selection:bg-orange-500/30 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#1a1a1a] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#2a2a2a]">
      
      <div className="max-w-5xl mx-auto space-y-10 pb-20">
        
        {/* ================= HEADER ================= */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-medium text-white tracking-tight mb-2">Knowledge Ingestion</h1>
            <p className="text-sm text-neutral-500 max-w-lg">
              Upload engineering manuals, P&ID diagrams, and maintenance logs. Our AI will automatically parse, index, and extract operational intelligence.
            </p>
          </div>
          
          <Link href="/documents" className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a] hover:bg-[#121212] text-white rounded-2xl text-sm font-medium transition-all border border-white/5 active:scale-95 transition-all">
            <Database size={14} className="text-neutral-400" /> View Indexed Database
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ================= LEFT COLUMN: UPLOAD ZONE ================= */}
          <div className="lg:col-span-2 space-y-6">
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />
            <div 
              className={`relative bg-[#050505] rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-16 text-center cursor-pointer ${
                isDragging ? 'border-orange-500/50 bg-orange-500/5' : 'border-white/10 hover:border-white/20 hover:bg-[#0a0a0a]'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { 
                e.preventDefault(); 
                setIsDragging(false); 
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileSelect(e.dataTransfer.files[0]);
                }
              }}
            >
              <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20">
                <UploadCloud size={28} className="text-orange-400" />
              </div>
              <h3 className="text-xl font-medium text-white tracking-tight mb-2">Drag & drop files here</h3>
              <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-8 leading-relaxed">
                Support for PDF, DOCX, TXT, CSV, and XLSX. Maximum file size 50MB.
              </p>
              
              <button className="px-6 py-3 bg-white text-black hover:bg-neutral-200 rounded-2xl text-sm font-medium transition-colors active:scale-95 transition-all">
                Browse Files
              </button>
            </div>

            {/* Ingestion Queue / Result */}
            {file && (
              <div className="bg-[#050505] rounded-3xl p-8 border border-white/5">
                <h3 className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest mb-6">Processing Status</h3>
                
                {isUploading && (
                  <div className="flex items-center gap-4 text-neutral-300">
                    <Loader2 size={20} className="animate-spin text-orange-400" />
                    <span>Uploading and processing {file.name}...</span>
                  </div>
                )}
                
                {error && (
                  <div className="flex items-center gap-4 text-rose-400">
                    <X size={20} />
                    <span>{error}</span>
                  </div>
                )}

                {uploadResult && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400 mb-4 font-medium">
                      <CheckCircle2 size={18} />
                      Document Indexed Successfully
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[11px] text-neutral-500 uppercase tracking-widest mb-1">File</div>
                        <div className="text-sm text-neutral-200 truncate">{uploadResult.upload.original_filename}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-neutral-500 uppercase tracking-widest mb-1">Status</div>
                        <div className="text-sm text-emerald-400">Indexed</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-neutral-500 uppercase tracking-widest mb-1">Characters</div>
                        <div className="text-sm text-neutral-200 font-mono">{uploadResult.parser.characters_extracted.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-neutral-500 uppercase tracking-widest mb-1">Chunks</div>
                        <div className="text-sm text-neutral-200 font-mono">{uploadResult.chunker.total_chunks}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-[11px] text-neutral-500 uppercase tracking-widest mb-1">Embedding Model</div>
                        <div className="text-sm text-neutral-200">{uploadResult.embedder.model}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ================= RIGHT COLUMN: AI PIPELINE ================= */}
          <div className="space-y-6">
            
            {/* AI Capabilities Card */}
            <div className="bg-gradient-to-br from-[#0a0a0a] to-[#050505] rounded-3xl p-8 border border-orange-900/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-orange-500/10 transition-colors transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"></div>
              
              <div className="flex items-center gap-2 mb-6">
                <Sparkles size={16} className="text-orange-400" />
                <h3 className="text-sm font-medium text-white">AI Processing Pipeline</h3>
              </div>
              
              <ul className="space-y-4 text-xs text-neutral-400 leading-relaxed">
                <li className="flex gap-3">
                  <CheckCircle2 size={14} className="text-neutral-600 shrink-0 mt-0.5" />
                  <span><strong>OCR & Extraction:</strong> Converts scanned diagrams and text into machine-readable formats.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 size={14} className="text-neutral-600 shrink-0 mt-0.5" />
                  <span><strong>Entity Recognition:</strong> Automatically tags equipment, parts, and personnel.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 size={14} className="text-neutral-600 shrink-0 mt-0.5" />
                  <span><strong>Vector Embeddings:</strong> Indexes content for semantic natural-language search.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
