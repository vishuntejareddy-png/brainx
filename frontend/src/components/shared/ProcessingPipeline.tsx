import { CheckCircle2 } from "lucide-react";

const steps = ["Upload", "Validation", "Metadata Extraction", "AI Indexing", "Knowledge Base"];

export function ProcessingPipeline() {
  return (
    <div className="rounded-2xl border border-border-hair bg-bg-card p-8">
      <h3 className="text-table-header font-semibold text-text-primary mb-8">Processing Pipeline</h3>
      <div className="flex items-center">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-mint/10 border border-mint/40 flex items-center justify-center">
                <CheckCircle2 size={16} className="text-mint" />
              </div>
              <span className="text-[10px] text-zinc-400 text-center max-w-[80px]">{step}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px bg-border-hair mx-2 mb-6" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
