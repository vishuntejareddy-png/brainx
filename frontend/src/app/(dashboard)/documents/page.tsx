"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { DocumentDetailsPanel } from "@/components/shared/DocumentDetailsPanel";
import {
  Search,
  Upload,
  FileText
} from "lucide-react";
import Link from "next/link";

interface RealDocument {
  filename: string;
  stored_filename: string;
  size: number;
  uploaded_at: string;
  chunks: number;
  status: string;
}

export default function DocumentsPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<RealDocument | null>(null);

  const { data: documents = [], isLoading: loading } = useSWR<RealDocument[]>(
    "http://localhost:8000/api/documents",
    fetcher,
    { fallbackData: [] }
  );

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      return d.filename.toLowerCase().includes(query.toLowerCase());
    });
  }, [query, documents]);

  const stats = {
    total: documents.length,
    indexed: documents.filter((d) => d.status === "Indexed").length,
    chunks: documents.reduce((sum, d) => sum + (d.chunks || 0), 0)
  };

  return (
    <div className="flex-1 flex">
      <section className="flex-1 p-8 lg:p-10 space-y-10">
        <div>
          <h1 className="text-h1 font-bold tracking-tight text-text-primary">Documents</h1>
          <p className="text-caption text-zinc-500 mt-2 max-w-xl">
            Centralized repository for engineering manuals, SOPs, inspections, maintenance logs, and operational knowledge.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-72 rounded-lg border border-border-hair bg-bg-card pl-9 pr-4 py-2 text-caption text-text-primary placeholder-zinc-500 outline-none focus:border-zinc-700 transition-colors"
            />
          </div>
          <Link href="/upload" className="flex items-center gap-2 rounded-lg bg-mint text-black px-4 py-2 text-caption font-semibold hover:opacity-90 transition-opacity active:scale-95 transition-all">
            <Upload size={12} /> Upload
          </Link>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: "Total Documents", value: loading ? "—" : stats.total.toLocaleString() },
            { label: "Successfully Indexed", value: loading ? "—" : stats.indexed.toLocaleString() },
            { label: "Generated Chunks", value: loading ? "—" : stats.chunks.toLocaleString() },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border-hair bg-gradient-to-b from-bg-card to-bg-card-2 p-6">
              <p className="text-caption text-zinc-500">{s.label}</p>
              <p className="text-3xl font-bold font-mono tracking-[-0.03em] text-text-primary mt-2">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border-hair bg-bg-card overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="py-16 text-center">
              <p className="text-body text-zinc-400">Loading documents...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center flex flex-col items-center">
              <FileText className="text-neutral-600 mb-4" size={32} />
              <p className="text-body text-zinc-400">No documents found.</p>
              <p className="text-caption text-zinc-600 mt-1 mb-6">Upload a new document to expand the knowledge base.</p>
              <Link href="/upload" className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors">
                Upload Document
              </Link>
            </div>
          ) : (
            <table className="w-full text-left text-table-cell">
              <thead>
                <tr className="text-zinc-500 font-medium border-b border-white/[0.04]">
                  <th className="px-8 pb-4 pt-6">Document</th>
                  <th className="px-4 pb-4 pt-6">Size</th>
                  <th className="px-4 pb-4 pt-6">Chunks</th>
                  <th className="px-4 pb-4 pt-6">Uploaded</th>
                  <th className="px-4 pb-4 pt-6">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc: RealDocument, idx: number) => (
                  <tr
                    key={idx}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.01] transition-colors group"
                  >
                    <td className="px-8 py-5 font-medium text-text-primary flex items-center gap-3">
                      <FileText size={13} className="text-zinc-500 shrink-0" />
                      {doc.filename}
                    </td>
                    <td className="px-4 py-5 font-mono text-zinc-500">{(doc.size / 1024).toFixed(1)} KB</td>
                    <td className="px-4 py-5 font-mono text-zinc-500">{doc.chunks}</td>
                    <td className="px-4 py-5 font-mono text-zinc-500">{new Date(doc.uploaded_at).toLocaleString()}</td>
                    <td className="px-4 py-5">
                      <span className="inline-flex items-center gap-1.5 text-caption font-medium text-mint">
                        <span className="h-1 w-1 rounded-full bg-mint" />
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
