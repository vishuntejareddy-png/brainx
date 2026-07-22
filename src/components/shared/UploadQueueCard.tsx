import { UploadQueueItem } from "@/types";
import { Loader2 } from "lucide-react";

const statusText: Record<UploadQueueItem["status"], string> = {
  Uploading: "text-zinc-300",
  Processing: "text-amber-400",
  Indexed: "text-mint",
  Failed: "text-rose-400",
};

const barColor: Record<UploadQueueItem["status"], string> = {
  Uploading: "bg-zinc-400",
  Processing: "bg-amber-400",
  Indexed: "bg-mint",
  Failed: "bg-rose-400",
};

export function UploadQueueCard({ items }: { items: UploadQueueItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-border-hair bg-bg-card p-8">
      <h3 className="text-table-header font-semibold text-text-primary mb-6">Upload Queue</h3>
      <div className="space-y-5">
        {items.map((item) => (
          <div key={item.id}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {item.status === "Uploading" && (
                  <Loader2 size={12} className="text-zinc-400 animate-spin" />
                )}
                <span className="text-caption text-text-primary">{item.name}</span>
                <span className="text-caption font-mono text-zinc-600">{item.fileType}</span>
              </div>
              <span className={`text-caption font-medium ${statusText[item.status]}`}>
                {item.status} · <span className="font-mono">{item.progress}%</span>
              </span>
            </div>
            <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div
                className={`h-full ${barColor[item.status]} rounded-full transition-all`}
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
