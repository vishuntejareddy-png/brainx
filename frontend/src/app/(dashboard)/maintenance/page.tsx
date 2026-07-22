'use client';

import React from 'react';
import { Settings, Wrench, Calendar, FilePlus } from 'lucide-react';
import Link from 'next/link';

export default function MaintenancePage() {
  return (
    <div className="flex flex-1 min-w-0 h-full bg-[#000000] text-neutral-200 overflow-hidden font-sans">
      
      <main className="flex-1 flex flex-col p-8 md:p-10">
        
        {/* HEADER */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-medium text-white tracking-tight mb-2">Maintenance</h1>
          <p className="text-sm text-neutral-500 mt-1 max-w-lg">Monitor equipment health, track activities, and manage operational risk.</p>
        </header>

        {/* EMPTY STATE */}
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-[#050505]">
          <div className="p-4 rounded-full bg-white/5 border border-white/10 mb-6 relative">
            <Wrench size={32} className="text-neutral-500" />
            <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-[#050505] border border-white/10">
              <Settings size={14} className="text-neutral-400" />
            </div>
          </div>
          
          <h2 className="text-xl font-medium text-white mb-2">No active maintenance records</h2>
          <p className="text-sm text-neutral-500 max-w-md text-center leading-relaxed mb-8">
            The maintenance tracking module is currently waiting for integration with your plant's ERP or EAM systems.
          </p>
          
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-2xl text-sm font-medium transition-colors hover:bg-neutral-200 active:scale-95 transition-all">
              <FilePlus size={16} /> Create Work Order
            </button>
            <Link href="/documents" className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a] border border-white/10 text-white rounded-2xl text-sm font-medium transition-colors hover:bg-white/5 active:scale-95 transition-all">
              <Calendar size={16} /> View Schedule
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
