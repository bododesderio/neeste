import React, { useState, useEffect } from "react";
import { api } from "../api.js";

export default function AdminProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
  });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      const response = await api.get("/admin/profile/me/");
      setUser(response.data);
      setFormData({
        username: response.data.username || "",
        email: response.data.email || "",
        first_name: response.data.first_name || "",
        last_name: response.data.last_name || "",
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setMessage("Failed to load profile ❌");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      const response = await api.put("/admin/profile/update/", formData);
      setUser(response.data);
      setFormData({
        username: response.data.username || "",
        email: response.data.email || "",
        first_name: response.data.first_name || "",
        last_name: response.data.last_name || "",
      });
      setMessage("Profile updated successfully ✅");
    } catch (error) {
      console.error("Failed to update profile:", error);
      setMessage(error.response?.data?.detail || "Failed to update profile ❌");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setMessage("");

    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage("New passwords don't match ❌");
      return;
    }

    if (passwordData.new_password.length < 8) {
      setMessage("Password must be at least 8 characters ❌");
      return;
    }

    setSaving(true);

    try {
      await api.post("/admin/profile/change-password/", {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setMessage("Password changed successfully ✅");
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setShowPasswordForm(false);
    } catch (error) {
      console.error("Failed to change password:", error);
      setMessage(error.response?.data?.detail || "Failed to change password ❌");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-white/70">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-white/70 text-sm">Manage your account settings</p>
      </div>

      {/* Profile Info Card */}
      <div className="glass rounded-3xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold text-3xl">
            {user?.username?.charAt(0).toUpperCase() || "A"}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{user?.username}</h2>
            <p className="text-sm text-white/60">{user?.email}</p>
            {user?.is_superuser && (
              <span className="inline-block mt-1 px-2 py-1 bg-yellow-400/20 text-yellow-400 text-xs rounded-lg font-semibold">
                Super Admin
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">First Name</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">Last Name</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-2xl bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            {message && (
              <div className={`px-4 py-2 rounded-xl ${message.includes("✅") ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                {message}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Change Password</h2>
            <p className="text-sm text-white/60 mt-1">Update your account password</p>
          </div>
          {!showPasswordForm && (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors text-sm"
            >
              Change Password
            </button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">Current Password</label>
              <input
                type="password"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-400"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-400"
                  required
                  minLength={8}
                />
                <p className="text-xs text-white/50 mt-1">Minimum 8 characters</p>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-400"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-2xl bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-50"
              >
                {saving ? "Updating..." : "Update Password"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
                  setMessage("");
                }}
                className="px-6 py-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Account Info */}
      <div className="glass rounded-3xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Account Type:</span>
            <span className="text-white font-semibold">
              {user?.is_superuser ? "Super Administrator" : "Administrator"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Status:</span>
            <span className="text-green-400 font-semibold">Active</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Staff Member:</span>
            <span className="text-white">{user?.is_staff ? "Yes" : "No"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
