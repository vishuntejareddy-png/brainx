import { DocumentRow } from "@/types";
import { AlertTriangle, X } from "lucide-react";

interface DocumentDetailsPanelProps {
  doc: DocumentRow;
  onClose: () => void;
}

export function DocumentDetailsPanel({ doc, onClose }: DocumentDetailsPanelProps) {
  return (
    <div className="w-96 shrink-0 border-l border-border-hair bg-bg-card-2 p-8 overflow-y-auto">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-h3 text-text-primary">{doc.name}</h3>
        <button onClick={onClose} className="text-zinc-500 hover:text-text-primary active:scale-95 transition-all">
          <X size={18} />
        </button>
      </div>
      <span className="text-caption text-zinc-500 font-mono">{doc.type}</span>

      <div className="grid grid-cols-2 gap-4 mt-6 text-table-cell">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">Equipment</p>
          <p className="font-mono text-zinc-300">{doc.equipment}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">Department</p>
          <p className="text-zinc-300">{doc.department}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">Owner</p>
          <p className="text-zinc-300">{doc.owner}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">Version</p>
          <p className="font-mono text-zinc-300">{doc.version}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">File Size</p>
          <p className="font-mono text-zinc-300">{doc.fileSize}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">Updated</p>
          <p className="font-mono text-zinc-300">{doc.updatedAt}</p>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-2">AI Summary</p>
        <p className="text-table-cell text-zinc-300">{doc.summary}</p>
      </div>

      {doc.relatedEquipment.length > 0 && (
        <div className="mt-8">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-2">Related Equipment</p>
          <div className="flex flex-wrap gap-2">
            {doc.relatedEquipment.map((eq) => (
              <span key={eq} className="font-mono text-caption text-zinc-400 border border-border-hair rounded-md px-2 py-1">
                {eq}
              </span>
            ))}
          </div>
        </div>
      )}

      {doc.relatedDocs.length > 0 && (
        <div className="mt-8">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-2">Related Documents</p>
          <div className="flex flex-col gap-2">
            {doc.relatedDocs.map((d) => (
              <span key={d} className="text-caption text-zinc-400 hover:text-mint cursor-pointer transition-colors">
                {d}
              </span>
            ))}
          </div>
        </div>
      )}

      {doc.aiInsights.length > 0 && (
        <div className="mt-8">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-2">AI Insights</p>
          <ul className="space-y-1.5">
            {doc.aiInsights.map((insight, i) => (
              <li key={i} className="text-table-cell text-zinc-300 flex gap-2">
                <span className="text-zinc-600">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 border-l-2 border-amber-400/60 bg-gradient-to-b from-amber-500/[0.06] to-transparent rounded-r-lg px-4 py-4 flex gap-3">
        <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] uppercase tracking-wider text-amber-400/80 mb-1">Recommended Action</p>
          <p className="text-table-cell text-amber-100/90">{doc.recommendedAction}</p>
        </div>
      </div>

      <div className="mt-8 flex gap-2">
        <button className="flex-1 bg-mint text-black text-btn font-semibold rounded-lg py-2.5 hover:opacity-90 transition-opacity active:scale-95 transition-all">
          Open Full Document
        </button>
      </div>
      <div className="mt-2 flex gap-2">
        <button className="flex-1 text-btn px-4 py-2.5 rounded-lg border border-border-hair text-zinc-300 hover:bg-white/[0.02] transition-colors active:scale-95 transition-all">
          Ask Copilot
        </button>
        <button className="flex-1 text-btn px-4 py-2.5 rounded-lg border border-border-hair text-zinc-300 hover:bg-white/[0.02] transition-colors active:scale-95 transition-all">
          Download
        </button>
      </div>
    </div>
  );
}
