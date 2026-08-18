"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, Shield, ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { DEFAULT_AVATAR_COLOR, getAvatarColor, getDisplayName, MockUser } from "@/data/users";
import { fetchCurrentUserFromApi, fetchUsersForManagement, updateUserRole } from "@/lib/auth";

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [user, setUser] = useState<MockUser | null>(null);
  const [role, setRole] = useState<"admin" | "moderator" | "user">("user");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);

  useEffect(() => {
    const id = String(params?.id ?? "");
    if (!id) {
      setError("User not found");
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        const [serverUser, users] = await Promise.all([
          fetchCurrentUserFromApi(),
          fetchUsersForManagement(),
        ]);

        setCurrentUser(serverUser);

        const target = users.find((item) => item.id === id || item.username === id);

        if (!target) {
          setError("User not found");
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(target);
        setRole(target.role);
      } catch {
        setError("Unable to load user details");
      } finally {
        setLoading(false);
      }
    };

    void loadUser();
  }, [params?.id]);

  const isCurrentUser = Boolean(
    currentUser && user && (
      currentUser.id === user.id ||
      currentUser.email?.toLowerCase() === user.email?.toLowerCase() ||
      currentUser.username?.toLowerCase() === user.username?.toLowerCase()
    )
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    if (isCurrentUser) {
      setError("You cannot change your own role or delete your own account.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await updateUserRole(user.id, role);
      setSuccess("User role updated successfully.");
      setTimeout(() => router.push("/dashboard/admin/users"), 700);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save role");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-60 items-center justify-center text-sm text-neutral-500">
        Loading user details...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <div className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
          <Link href="/dashboard/admin" className="hover:text-brand-gold">Dashboard</Link>
          <span className="mx-2">/</span>
          <Link href="/dashboard/admin/users" className="hover:text-brand-gold">Users</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-600">Edit</span>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">{error || "User not found."}</div>
      </div>
    );
  }

  if (isCurrentUser) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/admin" }, { label: "Users", href: "/dashboard/admin/users" }, { label: "Edit user" }]} />

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
          <div className="mb-3 font-semibold">This is your own account.</div>
          <div className="mb-4">You can update your profile details from your profile page, but role changes and delete actions stay protected.</div>
          <button
            type="button"
            onClick={() => router.push("/dashboard/admin/profile")}
            className="rounded-xl bg-brand-gold px-4 py-2 text-sm font-semibold text-white hover:bg-brand-gold-light"
          >
            Open profile editor
          </button>
        </div>
      </div>
    );
  }

  const initials = getDisplayName(user)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() || "")
    .join("") || "U";

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/admin" }, { label: "Users", href: "/dashboard/admin/users" }, { label: "Edit user" }]} />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900">Edit user</h1>
        </div>
        <button type="button" onClick={() => router.push("/dashboard/admin/users")} className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white" style={{ backgroundColor: getAvatarColor(user) || DEFAULT_AVATAR_COLOR }}>
            {initials}
          </div>
          <div>
            <div className="text-xl font-bold text-neutral-900">{getDisplayName(user)}</div>
            <div className="text-sm text-neutral-500">@{user.username || "user"}</div>
          </div>
        </div>

        {error && <StatusMessage type="error" message={error} />}
        {success && <StatusMessage type="success" title="Saved" message={success} />}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Full name</label>
              <input value={getDisplayName(user)} readOnly className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-3 py-2.5 text-sm text-neutral-600" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Email</label>
              <input value={user.email} readOnly className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-3 py-2.5 text-sm text-neutral-600" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Username</label>
              <input value={user.username || "user"} readOnly className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-3 py-2.5 text-sm text-neutral-600" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Current role</label>
              <div className="flex h-11.5 items-center rounded-xl border border-neutral-200 bg-neutral-100 px-3 text-sm font-semibold text-neutral-700">
                {String(user.role).toUpperCase()}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Role</label>
            <div className="flex items-center gap-3">
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as "admin" | "moderator" | "user")}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none focus:border-neutral-300"
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1.5 text-xs font-semibold text-neutral-700">
                {role === "admin" ? <ShieldCheck className="h-3.5 w-3.5 text-amber-600" /> : <Shield className="h-3.5 w-3.5 text-indigo-600" />}
                {String(role).toUpperCase()}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-600">
            <div className="flex items-center justify-between gap-3">
              <span>Updated on</span>
              <span className="font-medium text-neutral-800">{user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "Unknown"}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => router.push("/dashboard/admin/users")} className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
              Cancel
            </button>
            <button type="submit" disabled={saving || isCurrentUser} className="inline-flex items-center gap-2 rounded-xl bg-brand-gold px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-gold-light disabled:cursor-not-allowed disabled:opacity-60">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
