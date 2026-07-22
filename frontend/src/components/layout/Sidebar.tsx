"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Upload,
  Wrench,
  Sparkles,
  BarChart3,
  Settings,
} from "lucide-react";

const sections = [
  {
    label: "General",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
    ],
  },
  {
    label: "Workspace",
    items: [
      { name: "Documents", href: "/documents", icon: FileText },
      { name: "Upload", href: "/upload", icon: Upload },
      { name: "Maintenance", href: "/maintenance", icon: Wrench },
    ],
  },
  {
    label: "Copilot",
    items: [{ name: "Knowledge Copilot", href: "/copilot", icon: Sparkles, highlight: true }],
  },
  {
    label: "Insights",
    items: [{ name: "Analytics", href: "/analytics", icon: BarChart3 }],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#000000] border-r border-white/[0.06] flex flex-col justify-between shrink-0 h-full">
      <div className="space-y-8 p-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-1 py-1">
          <div className="h-5 w-5 rounded bg-emerald-500 flex items-center justify-center font-bold text-black text-xs">
            I
          </div>
          <span className="font-semibold text-white tracking-tight text-sm">Industrial Brain</span>
        </div>

        {/* Nav Sections */}
        <nav className="space-y-6">
          {sections.map((section) => (
            <div key={section.label}>
              <div className="px-2 text-[11px] font-medium text-neutral-600 uppercase tracking-widest mb-2.5">
                {section.label}
              </div>
              <ul className="space-y-1">
                {section.items.map((item: any) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href ||
                    (item.name === "Dashboard" && pathname === "/");
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-r-lg text-[13px] transition-all duration-200 ease-out group ${
                          active
                            ? "text-white font-medium bg-[#101010] border-l-[4px] border-[#2563EB]"
                            : "text-neutral-500 hover:text-neutral-300 font-normal border-l-[4px] border-transparent hover:bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`transition-colors duration-200 ${
                              active
                                ? "text-white"
                                : "text-neutral-500 group-hover:text-neutral-300"
                            }`}
                          >
                            <Icon
                              size={15}
                              className={item.highlight && !active ? "text-amber-500/70 group-hover:text-amber-500" : ""}
                            />
                          </div>
                          <span className="tracking-wide">{item.name}</span>
                        </div>
                        {item.highlight && !active && (
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-500/50 group-hover:bg-amber-500 transition-colors" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* User Card */}
      <div className="p-4 border-t border-white/[0.06] bg-[#000000]">
        <div className="flex items-center justify-between group cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-neutral-900 border border-white/[0.05] flex items-center justify-center text-xs font-semibold text-neutral-400">
              A
            </div>
            <div>
              <div className="text-[13px] font-medium text-white leading-none tracking-tight">
                Admin User
              </div>
              <div className="text-[11px] text-neutral-500 font-normal mt-1.5">
                Workspace Owner
              </div>
            </div>
          </div>
          <button className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-white/[0.04] transition-colors duration-200">
            <Settings size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
