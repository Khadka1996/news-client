"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Ban, Eye, Pencil, Search, Shield, ShieldCheck, Trash2, UserCog, Users, X } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { DEFAULT_AVATAR_COLOR, getAvatarColor, getDisplayName, MockUser } from "@/data/users";
import { deleteUser, fetchCurrentUserFromApi, fetchUserSummary, fetchUsersForManagement } from "@/lib/auth";

const iconClass = "h-5 w-5";

type SummaryCard = {
  key: "totalUsers" | "totalAdmins" | "totalModerators" | "totalDisabledAccounts";
  label: string;
  value: number;
  percentChange: number;
  tone: "blue" | "green" | "amber" | "red";
  icon: React.ReactNode;
};

function MiniTrend({ percentChange }: { percentChange: number }) {
  const isPositive = percentChange >= 0;
  const color = isPositive ? "#16a34a" : "#ef4444";
  const pathY = isPositive ? 18 - Math.min(Math.abs(percentChange) / 100, 0.7) * 16 : 18 + Math.min(Math.abs(percentChange) / 100, 0.7) * 16;

  return (
    <div className="flex items-center gap-2 text-xs font-semibold">
      <span style={{ color }}>{isPositive ? "+" : ""}{percentChange}%</span>
      <svg viewBox="0 0 60 30" className="h-6 w-16 overflow-visible">
        <path
          d={`M 0 18 Q 15 18 30 ${pathY} T 60 14`}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function formatLastLogin(value?: string | null): string {
  if (!value) return "Never";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Never";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<MockUser[]>([]);
  const [summary, setSummary] = useState<{
    totalUsers: number;
    totalAdmins: number;
    totalModerators: number;
    totalDisabledAccounts: number;
    totalAccounts: number;
    percentChange: {
      totalUsers: number;
      totalAdmins: number;
      totalModerators: number;
      totalDisabledAccounts: number;
    };
    chart: Array<{ key: string; label: string; value: number; percent: number }>;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "moderator" | "user">("all");
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MockUser | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);

  const router = useRouter();

  const loadData = async () => {
    try {
      const [items, stats] = await Promise.all([
        fetchUsersForManagement(),
        fetchUserSummary(),
      ]);

      setUsers(items);
      setSummary(stats ?? null);
    } catch {
      setUsers([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const [current, items, stats] = await Promise.all([
          fetchCurrentUserFromApi(),
          fetchUsersForManagement(),
          fetchUserSummary(),
        ]);

        if (!active) return;
        setCurrentUser(current);
        setUsers(items);
        setSummary(stats ?? null);
      } catch {
        if (!active) return;
        setCurrentUser(null);
        setUsers([]);
        setSummary(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      if (!matchesRole) return false;

      if (!query) return true;

      const name = getDisplayName(user).toLowerCase();
      const email = (user.email || "").toLowerCase();
      const username = (user.username || "").toLowerCase();
      const role = user.role.toLowerCase();

      return name.includes(query) || email.includes(query) || username.includes(query) || role.includes(query);
    });
  }, [roleFilter, search, users]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedUsers = filteredUsers.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [roleFilter, search]);

  const stats: SummaryCard[] = summary
    ? [
        {
          key: "totalUsers",
          label: "Total Users",
          value: summary.totalUsers,
          percentChange: summary.percentChange.totalUsers,
          tone: "blue",
          icon: <Users className={iconClass} />,
        },
        {
          key: "totalAdmins",
          label: "Admins",
          value: summary.totalAdmins,
          percentChange: summary.percentChange.totalAdmins,
          tone: "green",
          icon: <ShieldCheck className={iconClass} />,
        },
        {
          key: "totalModerators",
          label: "Moderators",
          value: summary.totalModerators,
          percentChange: summary.percentChange.totalModerators,
          tone: "amber",
          icon: <UserCog className={iconClass} />,
        },
        {
          key: "totalDisabledAccounts",
          label: "Disabled Accounts",
          value: summary.totalDisabledAccounts,
          percentChange: summary.percentChange.totalDisabledAccounts,
          tone: "red",
          icon: <Ban className={iconClass} />,
        },
      ]
    : [];

  const toneClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    green: "bg-emerald-100 text-emerald-700 border-emerald-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    red: "bg-red-100 text-red-700 border-red-200",
  };

  const handleDeleteUser = async (userId: string) => {
    setActionLoadingId(userId);
    setStatus(null);
    try {
      await deleteUser(userId);
      setDeleteTarget(null);
      setStatus({ type: "success", message: "User deleted successfully." });
      await loadData();
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Failed to delete user." });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/admin" }, { label: "Users" }]} />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900">Users</h1>
        </div>
      </div>

      {status && <StatusMessage type={status.type} title={status.type === "success" ? "Saved" : "Error"} message={status.message} />}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.key}
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.02)]"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${toneClasses[stat.tone]}`}>
                {stat.icon}
              </div>
              <MiniTrend percentChange={stat.percentChange} />
            </div>

            <div className="text-3xl font-extrabold text-neutral-900">{stat.value}</div>
            <div className="mt-2 text-lg font-semibold text-neutral-700">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.02)]">
        <div className="flex flex-col gap-4 border-b border-neutral-200 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-9 pr-3 text-sm text-neutral-700 outline-none transition focus:border-neutral-300 focus:bg-white"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as "all" | "admin" | "moderator" | "user")}
            className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 outline-none focus:border-neutral-300"
          >
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="user">User</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
              <tr>
                <th className="px-4 py-3">S.NO</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Login</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-neutral-500">
                    Loading users...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-neutral-500">
                    No users found
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => {
                  const isCurrentUser = currentUser?.id === user.id;
                  const isBusy = actionLoadingId === user.id;
                  const displayName = getDisplayName(user);
                  const avatarColor = getAvatarColor(user) || DEFAULT_AVATAR_COLOR;
                  const initials = displayName
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((segment) => segment[0]?.toUpperCase() || "")
                    .join("") || "U";

                  return (
                    <tr key={user.id} className="bg-white hover:bg-neutral-50/70">
                      <td className="px-4 py-4 font-semibold text-neutral-700">{(safePage - 1) * pageSize + index + 1}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: avatarColor }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-800">{displayName}</div>
                            <div className="text-xs text-neutral-500">@{user.username || "user"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-neutral-600">{user.email}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            user.role === "admin"
                              ? "bg-amber-100 text-amber-700"
                              : user.role === "moderator"
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {user.role === "admin" ? <ShieldCheck className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                          {String(user.role).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            user.active === false
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {user.active === false ? "Disabled" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-neutral-600">
                        {formatLastLogin(user.lastLogin)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label="View user"
                            onClick={() => setSelectedUser(user)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            aria-label="Edit user"
                            disabled={isBusy}
                            onClick={() => {
                              if (isCurrentUser) {
                                router.push("/dashboard/admin/profile");
                                return;
                              }
                              router.push(`/dashboard/admin/users/${user.id}/edit`);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            aria-label="Delete user"
                            disabled={isCurrentUser || isBusy}
                            onClick={() => setDeleteTarget(user)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">User preview</p>
                <h2 className="mt-1 text-2xl font-bold text-neutral-900">{getDisplayName(selectedUser)}</h2>
              </div>
              <button type="button" onClick={() => setSelectedUser(null)} className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: getAvatarColor(selectedUser) || DEFAULT_AVATAR_COLOR }}>
                  {getDisplayName(selectedUser).split(" ").filter(Boolean).slice(0,2).map((segment) => segment[0]?.toUpperCase() || "").join("") || "U"}
                </div>
                <div>
                  <div className="text-base font-semibold text-neutral-800">@{selectedUser.username || "user"}</div>
                  <div className="text-sm text-neutral-500">{selectedUser.email}</div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-neutral-200 p-3">
                  <div className="text-xs uppercase tracking-wide text-neutral-400">Role</div>
                  <div className="mt-2 font-semibold text-neutral-900">{String(selectedUser.role).toUpperCase()}</div>
                </div>
                <div className="rounded-xl border border-neutral-200 p-3">
                  <div className="text-xs uppercase tracking-wide text-neutral-400">Status</div>
                  <div className="mt-2 font-semibold text-neutral-900">{selectedUser.active === false ? "Disabled" : "Active"}</div>
                </div>
                <div className="rounded-xl border border-neutral-200 p-3">
                  <div className="text-xs uppercase tracking-wide text-neutral-400">Last login</div>
                  <div className="mt-2 font-semibold text-neutral-900">{formatLastLogin(selectedUser.lastLogin)}</div>
                </div>
                <div className="rounded-xl border border-neutral-200 p-3">
                  <div className="text-xs uppercase tracking-wide text-neutral-400">Designation</div>
                  <div className="mt-2 font-semibold text-neutral-900">{selectedUser.designation || "Reader"}</div>
                </div>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
                <div className="flex items-center justify-between">
                  <span>Created on</span>
                  <span>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : "Unknown"}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span>Updated on</span>
                  <span>{selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : "Unknown"}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setSelectedUser(null)} className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">Close</button>
              <button type="button" onClick={() => { setSelectedUser(null); router.push(`/dashboard/admin/users/${selectedUser.id}/edit`); }} className="rounded-xl bg-brand-gold px-4 py-2 text-sm font-semibold text-white hover:bg-brand-gold-light">Edit details</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          open={Boolean(deleteTarget)}
          title="Delete user"
          confirmLabel={actionLoadingId === deleteTarget.id ? "Deleting..." : "Delete role"}
          onConfirm={() => handleDeleteUser(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
          danger
          message={
            <>
              <p className="text-sm text-neutral-600">
                Are you sure you want to remove <span className="font-semibold text-neutral-900">{getDisplayName(deleteTarget)}</span> permanently? This action cannot be undone.
              </p>
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <div className="font-semibold">Role: {String(deleteTarget.role).toUpperCase()}</div>
                <div className="mt-1">Username: @{deleteTarget.username || "user"}</div>
              </div>
            </>
          }
        />
      )}

      {!loading && filteredUsers.length > 0 && (
        <Pagination page={safePage} totalPages={totalPages} onPageChange={(nextPage) => setPage(nextPage)} />
      )}
    </div>
  );
}
