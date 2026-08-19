"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  PlusCircle,
  Tag,
  UserRoundPen,
  Video,
  Megaphone,
  BarChart3,
  Users,
  User,
  Settings,
  LifeBuoy,
  LogOut,
  X,
} from "lucide-react";
import { UserRole } from "@/data/users";
import { logout } from "@/lib/auth";

interface DashboardSidebarProps {
  role: UserRole;
  isCollapsed: boolean; // desktop: collapsed vs full width
  isMobileOpen: boolean; // mobile: drawer open vs hidden
  onClose: () => void; // closes the mobile drawer
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

// Admins get the full newsroom toolkit. Moderators only get what they
// actually need to do their job — this is the "different fields" per role.
const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "News", href: "/dashboard/admin/news", icon: Newspaper },
  { label: "Create News", href: "/dashboard/admin/news/new", icon: PlusCircle },
  { label: "Create Categories", href: "/dashboard/admin/categories", icon: Tag },
  { label: "Manage Authors", href: "/dashboard/admin/authors", icon: UserRoundPen },
  { label: "Manage Video", href: "/dashboard/admin/videos", icon: Video },
  { label: "Manage Advertisement", href: "/dashboard/admin/advertisements", icon: Megaphone },
  { label: "Analytics", href: "/dashboard/admin/analytics", icon: BarChart3 },
  { label: "Manage Users", href: "/dashboard/admin/users", icon: Users },
];

const adminAccountItems: NavItem[] = [
  { label: "Profile", href: "/dashboard/admin/profile", icon: User },
  { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  { label: "Support", href: "/dashboard/admin/support", icon: LifeBuoy },
];

const moderatorNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/moderator", icon: LayoutDashboard },
  { label: "News", href: "/dashboard/moderator/news", icon: Newspaper },
];

const moderatorAccountItems: NavItem[] = [
  { label: "Profile", href: "/dashboard/moderator/profile", icon: User },
  { label: "Settings", href: "/dashboard/moderator/settings", icon: Settings },
  { label: "Support", href: "/dashboard/moderator/support", icon: LifeBuoy },
];

export default function DashboardSidebar({ role, isCollapsed, isMobileOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const mainItems = role === "admin" ? adminNavItems : moderatorNavItems;
  const accountItems = role === "admin" ? adminAccountItems : moderatorAccountItems;

  const isActive = (href: string) => {
    if (href === `/dashboard/${role}`) return pathname === href;
    return pathname.startsWith(href);
  };

  const navigate = (href: string) => {
    router.push(href);
    onClose();
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Labels always show on the mobile drawer, even if the desktop
  // "collapsed" state happens to be true.
  const showLabels = !isCollapsed || isMobileOpen;

  const renderSection = (items: NavItem[], sectionLabel: string) => (
    <div>
      {showLabels && (
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-2">
          {sectionLabel}
        </p>
      )}
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              title={!showLabels ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-amber-50 text-brand-gold font-semibold"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              } ${!showLabels ? "justify-center" : ""}`}
            >
              <span className="shrink-0">
                <Icon size={19} />
              </span>
              {showLabels && <span className="flex-1 text-left">{item.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onClose} />}

      <aside
        className={`bg-white border-r border-neutral-200 h-screen fixed md:sticky top-0 left-0 z-50 md:z-auto overflow-y-auto overflow-x-hidden shrink-0 transition-all duration-300 w-64 ${
          isCollapsed ? "md:w-20" : "md:w-64"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Logo / brand */}
        <div
          className={`p-4 border-b border-neutral-200 flex items-center gap-2 ${
            isCollapsed && !isMobileOpen ? "md:justify-center md:px-0" : "justify-between"
          }`}
        >
          <div className={`flex items-center gap-2 overflow-hidden ${isCollapsed && !isMobileOpen ? "md:justify-center" : ""}`}>
            <div className="w-9 h-9 rounded-xl bg-brand-dark text-brand-gold flex items-center justify-center font-extrabold text-sm shrink-0">
              शि
            </div>
            <span className={`text-lg font-extrabold text-brand-dark whitespace-nowrap ${isCollapsed ? "md:hidden" : ""}`}>
              Shikka <span className="text-brand-gold">{role === "admin" ? "Admin" : "Mod"}</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg hover:bg-neutral-100 transition-colors shrink-0"
            aria-label="Close sidebar"
          >
            <X size={18} className="text-neutral-500" />
          </button>
        </div>

        <nav className="p-3 space-y-6">
          {renderSection(mainItems, "Main")}
          {renderSection(accountItems, "Account")}

          <div className="border-t border-neutral-200 pt-4">
            <button
              onClick={handleLogout}
              title={!showLabels ? "Logout" : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors ${
                !showLabels ? "justify-center" : ""
              }`}
            >
              <LogOut size={19} />
              {showLabels && <span>Logout</span>}
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
