import { redirect } from "next/navigation";

/**
 * Root route — redirects to the dashboard.
 * No UI is rendered here; this is purely a routing entry point.
 */
export default function RootPage() {
  redirect("/dashboard");
}
