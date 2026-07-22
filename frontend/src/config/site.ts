/**
 * Site-wide configuration constants.
 * All display strings, metadata, and nav structure live here.
 */

export const siteConfig = {
  name: "BrainXAI",
  tagline: "Industrial Knowledge Intelligence",
  description:
    "AI-powered knowledge management and maintenance intelligence platform for industrial operations.",
  url: "https://brainxai.com",
  version: "1.0.0",
} as const;

export type NavItem = {
  label: string;
  href: string;
  icon: string; // Lucide icon name — resolved at render time
  badge?: string;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Knowledge Copilot", href: "/copilot", icon: "MessageSquare", badge: "AI" },
  { label: "Documents", href: "/documents", icon: "FileText" },
  { label: "Upload", href: "/upload", icon: "Upload" },
  { label: "Maintenance", href: "/maintenance", icon: "Wrench" },
  { label: "Settings", href: "/settings", icon: "Settings" },
];
