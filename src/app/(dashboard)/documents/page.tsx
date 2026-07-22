"use client";

import { useMemo, useState } from "react";
import { documentRows } from "@/lib/mock-data";
import { DocumentRow, DocStatus } from "@/types";
import { DocumentDetailsPanel } from "@/components/shared/DocumentDetailsPanel";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  List,
  Upload,
  Download,
  RefreshCw,
  FileCheck,
  Eye,
  MoreHorizontal,
  MessageSquare,
} from "lucide-react";

const statusText: Record<DocStatus, string> = {
  Indexed: "text-mint",
  Processing: "text-amber-400",
  "Review Required": "text-amber-400",
  Archived: "text-zinc-500",
};

const statusDot: Record<DocStatus, string> = {
  Indexed: "bg-mint",
  Processing: "bg-amber-400",
  "Review Required": "bg-amber-400",
  Archived: "bg-zinc-500",
};

const statusFilters: DocStatus[] = ["Indexed", "Processing", "Review Required", "Archived"];

export default function DocumentsPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DocStatus | null>(null);
  const [selected, setSelected] = useState<DocumentRow | null>(null);

  const filtered = useMemo(() => {
    return documentRows.filter((d) => {
      const matchesQuery = d.name.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter ? d.status === statusFilter : true;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter]);

  const stats = {
    total: documentRows.length * 125, // mock scaling to 1,247-ish for display
    indexed: documentRows.filter((d) => d.status === "Indexed").length * 120,
    processing: documentRows.filter((d) => d.status === "Processing").length * 15,
    review: documentRows.filter((d) => d.status === "Review Required").length * 13,
  };

  return (
    <div className="flex-1 flex">
      <section className="flex-1 p-8 lg:p-10 space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-h1 font-bold tracking-tight text-text-primary">Documents</h1>
          <p className="text-caption text-zinc-500 mt-2 max-w-xl">
            Centralized repository for engineering manuals, SOPs, inspections, maintenance logs, and operational knowledge.
          </p>
        </div>

        {/* Action bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search documents..."
                className="w-56 rounded-lg border border-border-hair bg-bg-card pl-9 pr-4 py-2 text-caption text-text-primary placeholder-zinc-500 outline-none focus:border-zinc-700 transition-colors"
              />
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-border-hair bg-bg-card px-4 py-2 text-caption font-medium text-zinc-300 hover:bg-white/[0.02] transition-colors">
              <SlidersHorizontal size={12} /> Filter
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-border-hair bg-bg-card px-4 py-2 text-caption font-medium text-zinc-300 hover:bg-white/[0.02] transition-colors">
              <ArrowUpDown size={12} /> Sort
            </button>
            <div className="flex items-center gap-1 rounded-lg border border-border-hair bg-bg-card p-1">
              <button className="p-1.5 rounded text-text-primary bg-white/[0.06]">
                <List size={14} />
              </button>
              <button className="p-1.5 rounded text-zinc-500 hover:text-zinc-300">
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-lg bg-mint text-black px-4 py-2 text-caption font-semibold hover:opacity-90 transition-opacity">
              <Upload size={12} /> Upload Document
            </button>
            <button className="p-2 rounded-lg border border-border-hair text-zinc-400 hover:text-zinc-200 transition-colors">
              <Download size={14} />
            </button>
            <button className="p-2 rounded-lg border border-border-hair text-zinc-400 hover:text-zinc-200 transition-colors">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Total Documents", value: stats.total.toLocaleString() },
            { label: "Indexed", value: stats.indexed.toLocaleString() },
            { label: "Processing", value: stats.processing.toLocaleString() },
            { label: "Requires Review", value: stats.review.toLocaleString() },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border-hair bg-gradient-to-b from-bg-card to-bg-card-2 p-6">
              <p className="text-caption text-zinc-500">{s.label}</p>
              <p className="text-3xl font-bold font-mono tracking-[-0.03em] text-text-primary mt-2">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? null : s)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-caption transition-colors ${
                statusFilter === s
                  ? "border-mint/40 text-mint bg-mint/[0.06]"
                  : "border-border-hair text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusDot[s]}`} />
              {s}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border-hair bg-bg-card overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-body text-zinc-400">No matching documents found.</p>
              <p className="text-caption text-zinc-600 mt-1">Try changing filters or upload a new document.</p>
            </div>
          ) : (
            <table className="w-full text-left text-table-cell">
              <thead>
                <tr className="text-zinc-500 font-medium">
                  <th className="px-8 pb-4 pt-6">Document</th>
                  <th className="px-4 pb-4 pt-6">Type</th>
                  <th className="px-4 pb-4 pt-6">Equipment</th>
                  <th className="px-4 pb-4 pt-6">Department</th>
                  <th className="px-4 pb-4 pt-6">Version</th>
                  <th className="px-4 pb-4 pt-6">Updated</th>
                  <th className="px-4 pb-4 pt-6">Status</th>
                  <th className="px-8 pb-4 pt-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() => setSelected(doc)}
                    className="border-t border-white/[0.04] hover:bg-white/[0.01] transition-colors cursor-pointer group"
                  >
                    <td className="px-8 py-5 font-medium text-text-primary flex items-center gap-3">
                      <FileCheck size={13} className="text-zinc-500 shrink-0" />
                      {doc.name}
                    </td>
                    <td className="px-4 py-5 text-zinc-400">{doc.type}</td>
                    <td className="px-4 py-5 font-mono text-zinc-500">{doc.equipment}</td>
                    <td className="px-4 py-5 text-zinc-400">{doc.department}</td>
                    <td className="px-4 py-5 font-mono text-zinc-500">{doc.version}</td>
                    <td className="px-4 py-5 font-mono text-zinc-500">{doc.updatedAt}</td>
                    <td className="px-4 py-5">
                      <span className={`inline-flex items-center gap-1.5 text-caption font-medium ${statusText[doc.status]}`}>
                        <span className={`h-1 w-1 rounded-full ${statusDot[doc.status]}`} />
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded text-zinc-500 hover:text-zinc-200"><Eye size={13} /></button>
                        <button className="p-1.5 rounded text-zinc-500 hover:text-zinc-200"><Download size={13} /></button>
                        <button className="p-1.5 rounded text-zinc-500 hover:text-mint"><MessageSquare size={13} /></button>
                        <button className="p-1.5 rounded text-zinc-500 hover:text-zinc-200"><MoreHorizontal size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-caption text-zinc-500">
          <button className="hover:text-zinc-200 transition-colors">Previous</button>
          <span>Page 1 of 25</span>
          <button className="hover:text-zinc-200 transition-colors">Next</button>
        </div>
      </section>

      {selected && <DocumentDetailsPanel doc={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
