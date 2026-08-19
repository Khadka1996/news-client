"use client";

import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { changeCurrentUserPassword, fetchCurrentUserFromApi, updateCurrentUserProfile } from "@/lib/auth";
import { getAvatarColor, getDisplayName, getUserDesignation, MockUser } from "@/data/users";

export default function AdminProfilePage() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    void fetchCurrentUserFromApi().then((latestUser) => {
      if (!latestUser) {
        setError("Unable to load your profile.");
        return;
      }
      setUser(latestUser);
      setFirstName(latestUser.firstName ?? "");
      setLastName(latestUser.lastName ?? "");
      setUsername(latestUser.username ?? "");
      setEmail(latestUser.email ?? "");
      setAvatar(latestUser.avatar ?? "");
    }).catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load your profile.")).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">Loading profile...</div>;
  if (!user) return <StatusMessage type="error" title="Profile unavailable" message={error || "Unable to load your profile."} />;

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
        avatar: avatar.trim() || null,
      });

      setUser(nextUser);
      setFirstName(nextUser.firstName ?? "");
      setLastName(nextUser.lastName ?? "");
      setUsername(nextUser.username ?? "");
      setEmail(nextUser.email ?? "");
      setAvatar(nextUser.avatar ?? "");
      setSuccess("Profile updated successfully.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setError("");
    setSuccess("");
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setChangingPassword(true);
    try {
      await changeCurrentUserPassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password changed successfully. Please sign in again.");
    } catch (passwordError) {
      setError(passwordError instanceof Error ? passwordError.message : "Unable to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/admin" }, { label: "Profile" }]} />
      <h1 className="text-2xl font-extrabold text-brand-dark mb-1">Profile</h1>
      <p className="text-sm text-neutral-500 mb-6">तपाईंको खाता विवरण</p>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          {avatar ? <img src={avatar} alt="Profile" className="h-16 w-16 rounded-full object-cover" /> : <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
            style={{ backgroundColor: avatarColor }}
          >
            {displayName.charAt(0)}
          </div>}
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
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-400">Avatar URL</label>
            <input value={avatar} onChange={(event) => setAvatar(event.target.value)} placeholder="https://example.com/avatar.jpg" className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
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
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">Designation</label>
            <input value={designation} readOnly className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">Role</label>
            <input value="Admin" disabled className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500" />
          </div>
        </div>

        <button type="button" onClick={handleSubmit} disabled={saving} className="mt-6 rounded-lg bg-brand-gold text-white text-sm font-semibold px-5 py-2.5 hover:bg-brand-gold-light disabled:opacity-60">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-brand-dark">Change password</h2>
        <p className="mt-1 text-sm text-neutral-500">Use at least 8 characters with one letter and one number.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Current password" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="New password" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm new password" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
        </div>
        <button type="button" onClick={() => void handlePasswordChange()} disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword} className="mt-5 rounded-lg bg-brand-dark px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
          {changingPassword ? "Changing..." : "Change password"}
        </button>
      </div>
    </div>
  );
}
