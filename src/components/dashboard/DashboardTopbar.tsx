"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  User as UserIcon,
  ChevronDown,
  LogOut,
  Settings,
  Menu,
  FileCheck2,
  MessageSquareWarning,
  UserPlus,
  CheckCircle2,
  Info,
} from "lucide-react";
import { MockUser, UserRole, getAvatarColor, getDisplayName, getUserDesignation } from "@/data/users";
import { adminNotifications, moderatorNotifications, NotificationType, AppNotification } from "@/data/notifications";
import { logout } from "@/lib/auth";

interface DashboardTopbarProps {
  role: UserRole;
  user: MockUser;
  onMenuClick: () => void;
}

const notificationStyles: Record<NotificationType, { icon: React.ElementType; bg: string; color: string }> = {
  review: { icon: FileCheck2, bg: "bg-amber-100", color: "text-amber-600" },
  comment: { icon: MessageSquareWarning, bg: "bg-red-100", color: "text-red-600" },
  user: { icon: UserPlus, bg: "bg-indigo-100", color: "text-indigo-600" },
  publish: { icon: CheckCircle2, bg: "bg-green-100", color: "text-green-600" },
  system: { icon: Info, bg: "bg-blue-100", color: "text-blue-600" },
};

export default function DashboardTopbar({ role, user, onMenuClick }: DashboardTopbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(
    role === "admin" ? adminNotifications : moderatorNotifications
  );

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayName = getDisplayName(user);
  const designation = getUserDesignation(user);
  const avatarColor = getAvatarColor(user);
  const initial = displayName.charAt(0).toUpperCase();

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="bg-white border-b border-neutral-200 px-3 sm:px-6 h-16 flex items-center justify-between w-full shadow-sm">
      {/* Left side - Hamburger + Search */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors shrink-0"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} className="text-neutral-700" />
        </button>

        <div className="relative w-full max-w-xs hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-full pl-9 pr-3 py-2 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-brand-gold focus:bg-white transition-colors"
          />
        </div>

        <button className="sm:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors" aria-label="Search">
          <Search size={19} className="text-neutral-600" />
        </button>
      </div>

      {/* Right side - Bell, User */}
      <div className="flex items-center gap-1 sm:gap-3 shrink-0">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative p-2 rounded-full hover:bg-neutral-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={19} className="text-neutral-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-[320px] sm:w-90 bg-white border border-neutral-200 rounded-lg shadow-lg z-30 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                  <h3 className="text-sm font-semibold text-neutral-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs font-medium text-brand-gold hover:underline">
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-90 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-neutral-400">No notifications yet</p>
                  ) : (
                    notifications.map((n) => {
                      const { icon: Icon, bg, color } = notificationStyles[n.type];
                      return (
                        <button
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50 ${
                            !n.read ? "bg-amber-50/60" : ""
                          }`}
                        >
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bg} ${color}`}>
                            <Icon size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-neutral-900">{n.title}</p>
                            <p className="mt-0.5 text-xs text-neutral-500 line-clamp-2">{n.description}</p>
                            <p className="mt-1 text-[11px] text-neutral-400">{n.time}</p>
                          </div>
                          {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-gold" />}
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="border-t border-neutral-100 px-4 py-2.5 text-center">
                  <button className="text-xs font-semibold text-brand-gold hover:underline">See all notifications</button>
                </div>
              </div>
            </>
          )}
        </div>

        <span className="hidden sm:block w-px h-8 bg-neutral-200 mx-1" />

        {/* User Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="flex items-center gap-2 p-1 pr-1 sm:pr-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <div className="text-right hidden sm:block leading-tight">
              <p className="text-sm font-semibold text-neutral-900">{displayName}</p>
              <p className="text-xs text-neutral-500">{designation}</p>
            </div>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-medium overflow-hidden shrink-0"
              style={{ backgroundColor: avatarColor }}
            >
              {initial}
            </div>
            <ChevronDown size={16} className="hidden sm:block text-neutral-400" />
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-30 py-1">
                <div className="px-4 py-2 sm:hidden border-b border-neutral-100 mb-1">
                  <p className="text-sm font-semibold text-neutral-900">{displayName}</p>
                  <p className="text-xs text-neutral-500">{designation}</p>
                </div>
                <button
                  onClick={() => router.push(`/dashboard/${role}/profile`)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-50 transition-colors"
                >
                  <UserIcon size={16} /> Profile
                </button>
                <button
                  onClick={() => router.push(`/dashboard/${role}/settings`)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-50 transition-colors"
                >
                  <Settings size={16} /> Settings
                </button>
                <hr className="my-1 border-neutral-200" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
