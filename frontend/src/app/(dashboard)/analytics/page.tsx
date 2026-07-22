'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar, Download, Sparkles,
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0a0a0a] border border-white/5 p-3 rounded-2xl shadow-2xl">
        <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-orange-400 text-lg font-medium">{payload[0].value} <span className="text-xs text-neutral-500">Queries</span></p>
      </div>
    );
  }
  return null;
};

interface AnalyticsData {
  total_queries: number;
  avg_generation_time_ms: number;
  queries_today: number;
  queries: any[];
}

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export default function AnalyticsPage() {
  const { data, isLoading: loading } = useSWR<AnalyticsData>(
    "http://localhost:8000/api/analytics",
    fetcher,
    { fallbackData: { total_queries: 0, avg_generation_time_ms: 0, queries_today: 0, queries: [] } }
  );

  // Compute chart data from queries
  const chartData = React.useMemo(() => {
    if (!data || !data.queries || data.queries.length === 0) {
      return [
        { name: 'Mon', volume: 0 },
        { name: 'Tue', volume: 0 },
        { name: 'Wed', volume: 0 },
        { name: 'Thu', volume: 0 },
        { name: 'Fri', volume: 0 },
      ];
    }
    // Group queries by day (mock implementation for demonstration)
    const grouped: Record<string, number> = {};
    data.queries.forEach(q => {
      const day = new Date(q.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
      grouped[day] = (grouped[day] || 0) + 1;
    });
    return Object.entries(grouped).map(([name, volume]) => ({ name, volume }));
  }, [data]);

  return (
    <div className="flex-1 min-w-0 h-full bg-[#000000] text-neutral-200 p-8 md:p-10 font-sans overflow-y-auto selection:bg-orange-500/30 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#1a1a1a] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#2a2a2a]">

      <div className="max-w-7xl mx-auto space-y-12 pb-20">

        {/* ================= HEADER & CONTROLS ================= */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-medium text-white tracking-tight mb-2">Analytics</h1>
            <p className="text-sm text-neutral-500 max-w-lg">
              Gain operational insights from industrial knowledge, maintenance activities, and AI Copilot usage.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex bg-[#0a0a0a] rounded-2xl p-1 border border-white/5">
              <ControlBtn icon={<Calendar size={14} />} label="Last 7 Days" />
            </div>

            <div className="w-px h-8 bg-white/10 mx-2"></div>

            <button className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors active:scale-95 transition-all">
              <Download size={14} /> Export
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300 rounded-2xl text-sm font-medium transition-all border border-orange-500/20 active:scale-95 transition-all">
              <Sparkles size={14} /> Generate AI Report
            </button>
          </div>
        </section>

        {/* ================= KPI CARDS (TOP ROW) ================= */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KpiCard title="Total AI Queries" value={loading ? "—" : (data?.total_queries.toString() || "0")} trend="All time" isPositive={true} />
          <KpiCard title="Queries Today" value={loading ? "—" : (data?.queries_today.toString() || "0")} trend="Last 24h" isPositive={true} />
          <KpiCard title="Avg Generation Time" value={loading ? "—" : `${data?.avg_generation_time_ms ? (data.avg_generation_time_ms / 1000).toFixed(2) : "0"}s`} trend="Performance" isNeutral={true} />
          <KpiCard title="Search Success Rate" value={loading ? "—" : "100%"} trend="Accuracy" isPositive={true} />
        </section>

        {/* ================= HERO SECTION (70 / 30) ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* 70% Chart */}
          <div className="lg:col-span-7 bg-[#050505] rounded-3xl p-8 border border-white/5 flex flex-col">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest mb-1">Copilot Usage</h3>
                <div className="text-2xl font-light text-white">Queries by Day</div>
              </div>
              <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 mt-1.5"></span>
                <span className="text-xs text-neutral-400">Total Queries</span>
              </div>
            </div>

            {/* Dynamic Recharts Implementation */}
            <div className="flex-1 h-48 mb-8 border-b border-white/5 pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#737373', fontSize: 10, fontWeight: 500 }} 
                    dy={10} 
                  />
                  <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }} content={<CustomTooltip />} />
                  <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                    {
                      chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="url(#orangeGradient)" />
                      ))
                    }
                  </Bar>
                  <defs>
                    <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#431407" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 30% Right Panel */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <SummaryCard label="Top Category" value="Troubleshooting" />
            <SummaryCard label="Avg Retrieval Time" value={loading ? "—" : "1.2s"} />
            <SummaryCard label="Avg Gen Tokens" value={loading ? "—" : "345"} />
          </div>
        </section>

        {/* ================= RECENT QUERIES TABLE ================= */}
        <section className="bg-[#050505] rounded-3xl p-8 border border-white/5">
          <h3 className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest mb-6">Recent Copilot Queries</h3>
          {loading ? (
            <div className="text-neutral-500 text-sm">Loading queries...</div>
          ) : data?.queries && data.queries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest border-b border-white/5">
                    <th className="pb-6 font-normal pl-2 w-1/2">Query</th>
                    <th className="pb-6 font-normal">Model</th>
                    <th className="pb-6 font-normal">Time (ms)</th>
                    <th className="pb-6 font-normal text-right pr-2">Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[...data.queries].reverse().slice(0, 10).map((q, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-[#0a0a0a] transition-colors last:border-0">
                      <td className="py-4 pl-2 text-white font-medium truncate max-w-md">{q.query}</td>
                      <td className="py-4 text-neutral-400">{q.model}</td>
                      <td className="py-4 text-neutral-400">{q.total_time_ms.toFixed(0)}</td>
                      <td className="py-4 pr-2 text-right text-neutral-500">{new Date(q.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-neutral-500 text-sm">No queries recorded yet.</div>
          )}
        </section>

      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function ControlBtn({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-white/5 transition-all active:scale-95 transition-all">
      {icon} {label}
    </button>
  );
}

function KpiCard({ title, value, trend, isPositive, isNeutral }: { title: string, value: string, trend: string, isPositive?: boolean, isNeutral?: boolean }) {
  return (
    <div className="bg-[#050505] rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
      <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest mb-4">{title}</div>
      <div className="flex items-end gap-3">
        <div className="text-4xl font-light text-white tracking-tight">{value}</div>
        {!isNeutral && (
          <div className={`flex items-center text-xs font-medium mb-1 ${isPositive ? 'text-neutral-400' : 'text-rose-400'}`}>
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, isAlert }: { label: string, value: string, isAlert?: boolean }) {
  return (
    <div className={`flex-1 rounded-3xl p-6 border flex flex-col justify-center ${isAlert ? 'bg-orange-500/5 border-orange-500/10' : 'bg-[#050505] border-white/5'}`}>
      <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest mb-2">{label}</div>
      <div className={`text-3xl font-light tracking-tight ${isAlert ? 'text-orange-400' : 'text-white'}`}>{value}</div>
    </div>
  );
}

