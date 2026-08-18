import DashboardShell from "@/components/dashboard/DashboardShell";

export default function ModeratorDashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="moderator">{children}</DashboardShell>;
}
