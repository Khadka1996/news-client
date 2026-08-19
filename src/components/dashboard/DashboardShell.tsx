"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import DashboardSidebar from "./DashboardSidebar";
import DashboardTopbar from "./DashboardTopbar";
import { fetchCurrentUserFromApi, getRoleLandingPath, logout, normalizeRole } from "@/lib/auth";
import { MockUser, UserRole } from "@/data/users";

export default function DashboardShell({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<MockUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const current = await fetchCurrentUserFromApi();

      if (!current) {
        await logout();
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      if (normalizeRole(current.role) !== role) {
        router.replace(getRoleLandingPath(normalizeRole(current.role)));
        return;
      }

      setUser(current);
      setChecking(false);
    };

    loadUser();
  }, [role, router, pathname]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) setIsMobileOpen(false);
    };
    handleChange(mq);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  const handleMenuClick = () => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setIsSidebarCollapsed((prev) => !prev);
    } else {
      setIsMobileOpen((prev) => !prev);
    }
  };

  if (checking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <p className="text-sm text-neutral-400">लोड हुँदैछ...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <DashboardSidebar
        role={role}
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
      />

      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <div className="z-30 w-full shrink-0 bg-white">
          <DashboardTopbar role={role} user={user} onMenuClick={handleMenuClick} />
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6 bg-[#F2F2F7]">
          {children}
        </main>
      </div>
    </div>
  );
}
