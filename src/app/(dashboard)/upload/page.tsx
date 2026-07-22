"use client";

import { uploadQueue, recentUploads, uploadActivity } from "@/lib/mock-data";
import { UploadDropzone } from "@/components/shared/UploadDropzone";
import { UploadQueueCard } from "@/components/shared/UploadQueueCard";
import { ProcessingPipeline } from "@/components/shared/ProcessingPipeline";
import { UploadStatus } from "@/types";
import {
  Upload,
  BookOpen,
  ClipboardList,
  Wrench,
  FileText,
  AlertTriangle,
  BarChart3,
  Ruler,
  Image as ImageIcon,
  UploadCloud,
} from "lucide-react";

const statusText: Record<UploadStatus, string> = {
  Uploading: "text-zinc-300",
  Processing: "text-amber-400",
  Indexed: "text-mint",
  Failed: "text-rose-400",
};

const statusDot: Record<UploadStatus, string> = {
  Uploading: "bg-zinc-400",
  Processing: "bg-amber-400",
  Indexed: "bg-mint",
  Failed: "bg-rose-400",
};

const docTypes = [
  { icon: BookOpen, title: "Engineering Manuals", desc: "Equipment documentation", format: "PDF / DOCX" },
  { icon: ClipboardList, title: "SOPs", desc: "Standard procedures", format: "PDF / DOCX" },
  { icon: Wrench, title: "Maintenance Logs", desc: "Service history", format: "CSV / XLSX" },
  { icon: FileText, title: "Inspection Reports", desc: "Field inspection data", format: "PDF" },
  { icon: AlertTriangle, title: "Incident Reports", desc: "Safety & incident logs", format: "PDF" },
  { icon: BarChart3, title: "CSV Operational Data", desc: "Sensor & telemetry data", format: "CSV" },
  { icon: Ruler, title: "Technical Specifications", desc: "Engineering drawings", format: "PDF / DWG" },
  { icon: ImageIcon, title: "Equipment Images", desc: "Visual documentation", format: "JPG / PNG" },
];

const futureIntegrations = ["SharePoint", "SAP PM", "IBM Maximo", "Azure Blob Storage", "AWS S3", "Google Drive"];

export default function UploadPage() {
  const isEmpty = uploadQueue.length === 0 && recentUploads.length === 0;

  const summary = {
    uploadedToday: recentUploads.length,
    indexed: recentUploads.filter((r) => r.status === "Indexed").length,
    processing: recentUploads.filter((r) => r.status === "Processing").length,
    failed: recentUploads.filter((r) => r.status === "Failed").length,
  };

  return (
    <div className="flex-1 flex">
      <section className="flex-1 p-8 lg:p-10 space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-h1 font-bold tracking-tight text-text-primary">Upload Knowledge</h1>
            <p className="text-caption text-zinc-500 mt-2 max-w-xl">
              Import engineering manuals, SOPs, inspection reports, maintenance logs, and operational documents into the knowledge base.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-lg bg-mint text-black px-4 py-2 text-caption font-semibold hover:opacity-90 transition-opacity">
              <Upload size={12} /> Upload Files
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-border-hair px-4 py-2 text-caption text-zinc-600 cursor-not-allowed">
              Scan Folder
              <span className="text-[10px] border border-border-hair rounded px-1.5 py-0.5">Soon</span>
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-border-hair px-4 py-2 text-caption text-zinc-600 cursor-not-allowed">
              Import from SharePoint
              <span className="text-[10px] border border-border-hair rounded px-1.5 py-0.5">Soon</span>
            </button>
          </div>
        </div>

        {isEmpty ? (
          <div className="rounded-xl border border-border-hair bg-bg-card py-20 text-center">
            <UploadCloud size={32} className="text-zinc-600 mx-auto mb-4" />
            <p className="text-body text-text-primary">No documents uploaded yet.</p>
            <p className="text-caption text-zinc-500 mt-1 max-w-sm mx-auto">
              Upload your first engineering document to begin building your industrial knowledge base.
            </p>
            <button className="mt-6 rounded-lg bg-mint text-black px-5 py-2.5 text-caption font-semibold hover:opacity-90 transition-opacity">
              Upload Document
            </button>
          </div>
        ) : (
          <>
            {/* Hero dropzone */}
            <UploadDropzone />

            {/* Upload queue */}
            <UploadQueueCard items={uploadQueue} />

            {/* Import summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Uploaded Today", value: summary.uploadedToday },
                { label: "Successfully Indexed", value: summary.indexed },
                { label: "Processing", value: summary.processing },
                { label: "Failed Imports", value: summary.failed },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border-hair bg-gradient-to-b from-bg-card to-bg-card-2 p-6">
                  <p className="text-caption text-zinc-500">{s.label}</p>
                  <p className="text-3xl font-bold font-mono tracking-[-0.03em] text-text-primary mt-2">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Recently uploaded table */}
            <div className="rounded-xl border border-border-hair bg-bg-card overflow-hidden">
              <div className="px-8 py-6">
                <h3 className="text-table-header font-semibold text-text-primary">Recently Uploaded</h3>
              </div>
              <table className="w-full text-left text-table-cell">
                <thead>
                  <tr className="text-zinc-500 font-medium">
                    <th className="px-8 pb-4">Document</th>
                    <th className="px-4 pb-4">Equipment</th>
                    <th className="px-4 pb-4">Department</th>
                    <th className="px-4 pb-4">Uploaded By</th>
                    <th className="px-4 pb-4">Time</th>
                    <th className="px-8 pb-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUploads.map((r) => (
                    <tr key={r.id} className="border-t border-white/[0.04] hover:bg-white/[0.01] transition-colors">
                      <td className="px-8 py-5 font-medium text-text-primary">{r.name}</td>
                      <td className="px-4 py-5 font-mono text-zinc-500">{r.equipment}</td>
                      <td className="px-4 py-5 text-zinc-400">{r.department}</td>
                      <td className="px-4 py-5 text-zinc-400">{r.uploadedBy}</td>
                      <td className="px-4 py-5 font-mono text-zinc-500">{r.time}</td>
                      <td className="px-8 py-5 text-right">
                        <span className={`inline-flex items-center gap-1.5 text-caption font-medium ${statusText[r.status]}`}>
                          <span className={`h-1 w-1 rounded-full ${statusDot[r.status]}`} />
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Supported document types */}
            <div>
              <h3 className="text-table-header font-semibold text-text-primary mb-6">Supported Document Types</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {docTypes.map((d) => (
                  <div key={d.title} className="rounded-xl border border-border-hair bg-bg-card p-6">
                    <d.icon size={18} className="text-zinc-500 mb-3" />
                    <p className="text-caption font-medium text-text-primary">{d.title}</p>
                    <p className="text-[10px] text-zinc-500 mt-1">{d.desc}</p>
                    <p className="text-[10px] font-mono text-zinc-600 mt-1">{d.format}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Processing pipeline */}
            <ProcessingPipeline />

            {/* Future integrations */}
            <div className="rounded-xl border border-border-hair bg-bg-card p-8">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-table-header font-semibold text-text-primary">Future Integrations</h3>
                <span className="text-[10px] text-zinc-600 border border-border-hair rounded px-1.5 py-0.5">
                  Coming Soon
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {futureIntegrations.map((f) => (
                  <span key={f} className="text-caption text-zinc-600 border border-border-hair rounded-full px-3 py-1.5">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      {/* Right activity panel */}
      <aside className="w-80 shrink-0 border-l border-border-hair bg-bg-card-2 p-8 space-y-6">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          Recent Upload Activity
        </h3>
        <div className="space-y-6">
          {uploadActivity.map((a) => (
            <div key={a.id} className="flex items-start gap-3">
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${statusDot[a.status]}`} />
              <div>
                <p className="text-caption text-zinc-300">{a.message}</p>
                <p className="text-[10px] font-mono text-zinc-600 mt-1">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
