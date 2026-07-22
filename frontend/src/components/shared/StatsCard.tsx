"use client";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  meta: string;
  segments: number[];
  isStable?: boolean;
}

export function StatsCard({
  title,
  value,
  change,
  meta,
  segments,
  isStable = false,
}: StatsCardProps) {
  return (
    <div className="bg-[#121212] border border-white/5 hover:border-neutral-700 transition-all duration-150 ease-out rounded-2xl p-5 flex flex-col justify-between h-36">
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest">
          {title}
        </span>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
            isStable
              ? "text-neutral-400 bg-[#1C1C1E] border-white/5"
              : "text-emerald-400 bg-emerald-950/10 border-emerald-900/20"
          }`}
        >
          {change}
        </span>
      </div>
      <div className="space-y-2">
        <div className="text-3xl font-semibold tracking-tight text-white">{value}</div>
        <div className="flex gap-1">
          {segments.map((active, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-sm ${
                active
                  ? isStable
                    ? "bg-neutral-600"
                    : "bg-emerald-500"
                  : "bg-[#2C2C2E]"
              }`}
            />
          ))}
        </div>
      </div>
      <div className="text-xs text-neutral-400 font-normal tracking-wide">{meta}</div>
    </div>
  );
}
