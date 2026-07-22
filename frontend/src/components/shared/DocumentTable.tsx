import { Document } from "@/types";
import { FileDown } from "lucide-react";

export function DocumentTable({ documents }: { documents: Document[] }) {
  const activeCount = documents.filter((d) => d.status === "Processing").length;

  return (
    <section className="bg-[#121212] border border-white/5 rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-white tracking-wider uppercase">
          Recent Operational Intel
        </h2>
        <span className="text-xs text-neutral-400 font-normal">
          {documents.length} total · {activeCount} active pipeline
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-white/5 text-[11px] font-medium text-neutral-500 uppercase tracking-widest">
              <th className="pb-3 px-2 font-bold tracking-wider">Document</th>
              <th className="pb-3 px-2 font-bold tracking-wider">Type</th>
              <th className="pb-3 px-2 font-bold tracking-wider">Equipment</th>
              <th className="pb-3 px-2 font-bold tracking-wider">Uploaded</th>
              <th className="pb-3 px-2 font-bold tracking-wider text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2C2C2E]/20 text-xs font-medium">
            {documents.map((doc) => {
              const isProcessing = doc.status === "Processing";
              const isFailed = doc.status === "Failed";
              const color = isProcessing
                ? "text-amber-400 bg-amber-950/20 border-amber-900/30"
                : isFailed
                ? "text-rose-400 bg-rose-950/20 border-rose-900/30"
                : "text-emerald-400 bg-emerald-950/20 border-emerald-900/30";

              return (
                <tr
                  key={doc.id}
                  className="hover:bg-[#1C1C1E]/30 transition-all duration-100 ease-out group"
                >
                  <td className="py-4 px-2 text-white flex items-center gap-2">
                    <FileDown
                      size={13}
                      className="text-[#8E8E93] group-hover:text-neutral-300 transition-colors"
                    />
                    <span className="tracking-wide font-normal">{doc.name}</span>
                  </td>
                  <td className="py-4 px-2 text-neutral-400 font-normal">{doc.type}</td>
                  <td className="py-4 px-2 text-neutral-400 font-normal">{doc.equipment}</td>
                  <td className="py-4 px-2 text-neutral-500 font-normal">{doc.uploadedAt}</td>
                  <td className="py-4 px-2 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${color}`}
                    >
                      {doc.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
