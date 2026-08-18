"use client";

import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { getCurrentUser, updateCurrentUserProfile } from "@/lib/auth";
import { getAvatarColor, getDisplayName, getUserDesignation, MockUser } from "@/data/users";

export default function ModeratorProfilePage() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const latestUser = getCurrentUser();
    if (!latestUser) return;

    setUser(latestUser);
    setFirstName(latestUser.firstName ?? "");
    setLastName(latestUser.lastName ?? "");
    setUsername(latestUser.username ?? "");
    setEmail(latestUser.email ?? "");
  }, []);

  if (!user) return null;

  const displayName = getDisplayName(user);
  const designation = getUserDesignation(user);
  const avatarColor = getAvatarColor(user);

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const nextUser = await updateCurrentUserProfile({
        firstName,
        lastName,
        username,
        email,
      });

      setUser(nextUser);
      setFirstName(nextUser.firstName ?? "");
      setLastName(nextUser.lastName ?? "");
      setUsername(nextUser.username ?? "");
      setEmail(nextUser.email ?? "");
      setSuccess("Profile updated successfully.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/moderator" }, { label: "Profile" }]} />
      <h1 className="text-2xl font-extrabold text-brand-dark mb-1">Profile</h1>
      <p className="text-sm text-neutral-500 mb-6">तपाईंको खाता विवरण</p>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
            style={{ backgroundColor: avatarColor }}
          >
            {displayName.charAt(0)}
          </div>
          <div>
            <h2 className="font-bold text-brand-dark text-lg">{displayName}</h2>
            <p className="text-sm text-neutral-500">{designation}</p>
          </div>
        </div>

        {error && <StatusMessage type="error" message={error} />}
        {success && <StatusMessage type="success" title="Saved" message={success} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">First Name</label>
            <input value={firstName} onChange={(event) => setFirstName(event.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">Last Name</label>
            <input value={lastName} onChange={(event) => setLastName(event.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">Username</label>
            <input value={username} onChange={(event) => setUsername(event.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">Email</label>
            <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">Role</label>
            <input value="Moderator" disabled className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500" />
          </div>
        </div>

        <button type="button" onClick={handleSubmit} disabled={saving} className="mt-6 rounded-lg bg-brand-gold text-white text-sm font-semibold px-5 py-2.5 hover:bg-brand-gold-light disabled:opacity-60">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
