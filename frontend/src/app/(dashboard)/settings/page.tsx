import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

/**
 * Settings page — placeholder.
 * Will be built in the component phase.
 */
export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="text-muted-foreground mt-1">Coming soon — design phase next.</p>
    </div>
  );
}
