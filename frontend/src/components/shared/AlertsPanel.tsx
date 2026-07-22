import { AlertTriangle, ArrowUpRight } from "lucide-react";

interface AlertItemProps {
  title: string;
  detail: string;
  code: string;
}

export function AlertsPanel({
  criticalCount,
  alerts,
}: {
  criticalCount: number;
  alerts: AlertItemProps[];
}) {
  return (
    <aside className="w-80 bg-[#000000] border-l border-white/5 p-5 flex flex-col justify-between shrink-0 h-full">
      <div className="space-y-5">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest">
            System Alerts
          </h2>
          <p className="text-[11px] text-neutral-400">Engineering triage required.</p>
        </div>

        {/* Critical Count Card */}
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 space-y-2">
          <div className="text-[9px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <AlertTriangle size={12} />
            <span>Action Required</span>
          </div>
          <div className="space-y-0.5">
            <div className="text-3xl font-light text-white tracking-tighter">
              {criticalCount}
            </div>
            <p className="text-sm text-neutral-400">Critical operational anomalies</p>
          </div>
        </div>

        {/* Alert Cards */}
        <div className="space-y-3">
          {alerts.map((a, i) => (
            <div
              key={i}
              className="bg-[#121212] border border-white/5 hover:border-neutral-700 transition-all duration-150 ease-out rounded-2xl p-4 space-y-2 text-left group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-white">
                <span className="tracking-wide">{a.title}</span>
                <span className="font-mono text-[10px] text-[#8E8E93] tracking-tight">
                  {a.code}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-normal leading-relaxed">
                {a.detail}
              </p>
              <div className="pt-0.5">
                <button className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8E8E93] hover:text-white transition-colors uppercase tracking-widest bg-[#1C1C1E] border border-white/5 rounded px-2 py-0.5 active:scale-95 transition-all">
                  <span>Telemetry</span>
                  <ArrowUpRight size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button className="w-full bg-[#121212] hover:bg-[#1C1C1E] border border-white/5 text-white font-medium rounded-2xl py-2.5 text-xs transition-all duration-150 ease-out shadow-sm mt-4 shrink-0 active:scale-95 transition-all">
        Open Incident Command
      </button>
    </aside>
  );
}
