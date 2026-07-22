"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { StatsCard } from "@/components/shared/StatsCard";
import { Search, SlidersHorizontal, FileText, Upload } from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  documents: number;
  chunks: number;
  queries: number;
  last_upload: string | null;
}

export default function DashboardPage() {
  const { data: stats, isLoading: loading } = useSWR<DashboardStats>(
    "http://localhost:8000/api/dashboard",
    fetcher,
    { fallbackData: { documents: 0, chunks: 0, queries: 0, last_upload: null } }
  );

  return (
    <>
      {/* MAIN WORKSPACE */}
      <div className="flex-1 min-w-0 h-full flex flex-col bg-[#000000]">
        <main className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#2C2C2E] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#3A3A3C]">

          {/* FRACTAL GLASS HERO BANNER */}
          <section className="h-52 rounded-2xl border border-white/10 relative overflow-hidden flex items-end shrink-0 shadow-2xl">
            {/* 1. Vibrant Spectrum Gradient */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(110deg, #020617 0%, #0284c7 18%, #9d174d 42%, #be123c 58%, #ea580c 78%, #fef08a 100%)",
              }}
            />
            {/* 2. Optical Glass Ribs */}
            <div
              className="absolute inset-0 mix-blend-overlay opacity-70 pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, transparent 0, transparent 4px, rgba(255,255,255,0.15) 4px, rgba(255,255,255,0.15) 5px, rgba(0,0,0,0.5) 5px, rgba(0,0,0,0.5) 8px)",
              }}
            />
            {/* 3. Vignettes */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

            {/* Content pinned to bottom */}
            <div className="relative w-full flex items-end justify-between z-10 p-7">
              <div className="max-w-xl space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Knowledge Operations Center
                </h1>
                <p className="text-sm text-neutral-300 font-normal leading-relaxed">
                  Unified access to engineering manuals, SOPs, plant inspections, and maintenance intelligence.
                </p>
              </div>
            </div>
          </section>

          {/* ANALYTICS GRID */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <StatsCard
              title="Indexed Documents"
              value={loading ? "—" : stats?.documents.toString() || "0"}
              change="Total Uploads"
              meta={stats?.last_upload ? `Last: ${stats.last_upload}` : "No documents yet"}
              segments={[1, 1, 1, 0]}
            />
            <StatsCard
              title="Knowledge Chunks"
              value={loading ? "—" : stats?.chunks.toString() || "0"}
              change="Vector Database"
              meta="Stored in ChromaDB"
              segments={[1, 1, 1, 1]}
            />
            <StatsCard
              title="AI Queries"
              value={loading ? "—" : stats?.queries.toString() || "0"}
              change="Copilot Usage"
              meta="Total queries processed"
              segments={[1, 1, 0, 0]}
              isStable
            />
          </section>

          {/* RECENT ACTIVITY */}
          <section className="rounded-2xl border border-white/[0.06] bg-[#0A0A0A] p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
            <div className="h-12 w-12 rounded-full bg-white/[0.04] flex items-center justify-center mb-4">
              <FileText className="text-neutral-500" size={24} />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Ready for Knowledge</h3>
            <p className="text-sm text-neutral-400 max-w-md mb-6">
              Upload your engineering documents to start building the Industrial Brain AI knowledge base.
            </p>
            <Link href="/upload" className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors">
              <Upload size={16} />
              Upload Document
            </Link>
          </section>
        </main>
      </div>
    </>
  );
}