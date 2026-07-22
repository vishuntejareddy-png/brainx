import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen bg-[#000000] text-white flex flex-row items-stretch overflow-hidden font-sans antialiased text-sm select-none">
      {/* Sidebar is hidden on small screens — full layout targets 1024px+ */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[64px] shrink-0 border-b border-white/[0.05] flex items-center px-6">
          <div className="text-[13px] font-medium text-neutral-400">
            Workspace
          </div>
        </header>
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
}
