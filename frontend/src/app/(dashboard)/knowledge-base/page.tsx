'use client';

import React, { useState } from 'react';

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import {
  Search, GitBranch, ChevronDown, FileText
} from 'lucide-react';

interface RealDocument {
  filename: string;
  stored_filename: string;
  size: number;
  uploaded_at: string;
  chunks: number;
  status: string;
}

export default function KnowledgeBase() {
  const { data: documents = [], isLoading: loading } = useSWR<RealDocument[]>(
    "http://localhost:8000/api/documents",
    fetcher,
    { fallbackData: [] }
  );

  const totalDocuments = documents.length;
  const totalChunks = documents.reduce((acc, doc) => acc + (doc.chunks || 0), 0);
  const recentDocs = [...documents].sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()).slice(0, 5);

  return (
    <div className="flex-1 min-w-0 h-full overflow-y-auto bg-[#000000] text-neutral-50 font-sans [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#2C2C2E] [&::-webkit-scrollbar-thumb]:rounded-full">
      <div className="p-6 space-y-8">

        {/* 1. HEADER */}
        <header>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Knowledge Base</h1>
          <p className="text-sm text-neutral-400 mt-1 font-normal">
            Explore connected engineering knowledge across equipment, procedures, incidents, inspections, and operational documentation.
          </p>
        </header>

        {/* 2. SEARCH HERO */}
        <section className="max-w-3xl mx-auto text-center space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            <input
              type="text"
              placeholder="Search engineering knowledge..."
              className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
            />
          </div>
        </section>

        {/* 3. KNOWLEDGE OVERVIEW */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Indexed Documents" value={loading ? "—" : totalDocuments.toString()} />
          <StatCard label="Knowledge Chunks" value={loading ? "—" : totalChunks.toString()} />
          <StatCard label="Equipment Covered" value={loading ? "—" : "N/A"} />
          <StatCard label="AI Summaries" value={loading ? "—" : "N/A"} />
        </section>

        {/* 4. MAIN CONTENT — Explorer | Details | Related */}
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_260px] gap-6">

          {/* LEFT: EXPLORER */}
          <aside className="space-y-4">
            <h2 className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest">
              Knowledge Explorer
            </h2>
            <div className="space-y-4 text-xs">
              <ExplorerNode title="All Uploads" items={documents.map(d => d.filename)} />
            </div>
          </aside>

          {/* CENTER: DETAILS */}
          <main className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 space-y-6 min-h-[300px]">
            {documents.length > 0 ? (
              <>
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-semibold text-white tracking-tight">{documents[0].filename}</h2>
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/30 border border-emerald-900/30 px-2 py-0.5 rounded">
                      {documents[0].status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 text-sm">
                  {[
                    { label: 'Size', value: `${(documents[0].size / 1024).toFixed(1)} KB` },
                    { label: 'Chunks', value: documents[0].chunks.toString() },
                    { label: 'Uploaded At', value: new Date(documents[0].uploaded_at).toLocaleString() },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest mb-1">{label}</div>
                      <div className="text-neutral-300">{value}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 space-y-3">
                <FileText size={24} />
                <p>No documents indexed yet.</p>
              </div>
            )}
          </main>

          {/* RIGHT: TIMELINE */}
          <aside className="space-y-4">
            <h2 className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest">
              Recent Knowledge Updates
            </h2>
            <div className="space-y-3">
              {recentDocs.length > 0 ? recentDocs.map((doc, i) => (
                <TimelineItem key={i} date={new Date(doc.uploaded_at).toLocaleDateString()} action={`${doc.filename} indexed`} />
              )) : (
                <div className="text-xs text-neutral-500">No recent activity.</div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#121212] border border-white/5 hover:border-neutral-700 transition-all duration-150 rounded-2xl p-4">
      <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest mb-2">{label}</div>
      <div className="text-xl font-semibold text-white tracking-tight">{value}</div>
    </div>
  );
}

function ExplorerNode({ title, items }: { title: string; items: string[] }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <div 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-neutral-300 hover:text-white cursor-pointer mb-2 transition-colors"
      >
        <ChevronDown size={13} className={`transform transition-transform ${open ? "" : "-rotate-90"}`} />
        <span className="font-medium text-xs">{title}</span>
      </div>
      {open && (
        <div className="pl-5 space-y-1.5">
          {items.map((item) => (
            <div
              key={item}
              className="text-xs text-neutral-500 hover:text-white cursor-pointer transition-colors truncate"
              title={item}
            >
              {item}
            </div>
          ))}
          {items.length === 0 && <div className="text-xs text-neutral-600">No items</div>}
        </div>
      )}
    </div>
  );
}

function TimelineItem({ date, action }: { date: string; action: string }) {
  return (
    <div className="flex gap-4 text-xs">
      <div className="text-neutral-600 w-16 shrink-0 truncate">{date}</div>
      <div className="text-neutral-300 flex items-center gap-2 truncate">
        <GitBranch size={11} className="text-neutral-700 shrink-0" />
        <span className="truncate" title={action}>{action}</span>
      </div>
    </div>
  );
}
