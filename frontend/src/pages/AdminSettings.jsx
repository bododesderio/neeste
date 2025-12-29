import React, { useState, useEffect } from "react";
import { api } from "../api.js";

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await api.get("/admin/settings/");
      setSettings(res.data);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      const formData = new FormData();
      
      // Text fields
      Object.keys(settings).forEach(key => {
        if (key !== 'logo' && key !== 'favicon' && key !== 'logo_url' && key !== 'favicon_url') {
          formData.append(key, settings[key] || '');
        }
      });

      await api.put("/admin/settings/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      alert("Settings saved successfully! Page will reload to apply changes.");
      window.location.reload();
    } catch (error) {
      alert("Failed to save settings: " + (error.response?.data?.detail || error.message));
    } finally {
      setSaving(false);
    }
  }

  async function handleResetVisits() {
    if (!window.confirm("Reset all visit tracking data to zero?")) return;
    
    try {
      await api.post("/admin/reset-visits/");
      alert("Visit counter reset successfully!");
      fetchSettings();
    } catch (error) {
      alert("Failed to reset visits");
    }
  }

  async function handleFileChange(field, file) {
    const formData = new FormData();
    formData.append(field, file);
    
    try {
      setSaving(true);
      await api.put("/admin/settings/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      fetchSettings();
    } catch (error) {
      alert("Failed to upload file");
    } finally {
      setSaving(false);
    }
  }

  function handleColorReset() {
    setSettings({
      ...settings,
      primary_color: "#fbbf24",
      secondary_color: "#0b1220",
      text_color: "#ffffff",
      text_secondary_color: "#94a3b8",
      button_bg_color: "#fbbf24",
      button_text_color: "#000000",
      link_color: "#fbbf24",
      link_hover_color: "#f59e0b",
      success_color: "#10b981",
      error_color: "#ef4444",
      warning_color: "#f59e0b",
      border_color: "#334155",
    });
  }

  if (loading) {
    return <div className="p-6 text-white/70">Loading settings...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-white/70 text-sm">Manage your site configuration, branding, and theme.</p>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
        >
          {showPreview ? "Hide Preview" : "Show Preview"}
        </button>
      </div>

      {/* Brand & Assets */}
      <div className="glass rounded-3xl p-6 space-y-6">
        <h2 className="text-xl font-bold text-white">Brand & Assets</h2>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Site Title</label>
            <input
              type="text"
              value={settings?.site_title || ""}
              onChange={(e) => setSettings({...settings, site_title: e.target.value})}
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Tagline</label>
            <input
              type="text"
              value={settings?.tagline || ""}
              onChange={(e) => setSettings({...settings, tagline: e.target.value})}
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files[0] && handleFileChange('logo', e.target.files[0])}
              className="hidden"
              id="logo-upload"
            />
            <label
              htmlFor="logo-upload"
              className="inline-block px-4 py-2 bg-yellow-400 text-black rounded-xl cursor-pointer hover:bg-yellow-300"
            >
              Choose file
            </label>
            <span className="ml-3 text-white/50 text-sm">
              {settings?.logo ? "File uploaded" : "No file chosen"}
            </span>
            <p className="text-xs text-white/50 mt-2">Recommended: PNG with transparent background</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Favicon</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files[0] && handleFileChange('favicon', e.target.files[0])}
              className="hidden"
              id="favicon-upload"
            />
            <label
              htmlFor="favicon-upload"
              className="inline-block px-4 py-2 bg-yellow-400 text-black rounded-xl cursor-pointer hover:bg-yellow-300"
            >
              Choose file
            </label>
            <span className="ml-3 text-white/50 text-sm">
              {settings?.favicon ? "File uploaded" : "No file chosen"}
            </span>
            <p className="text-xs text-white/50 mt-2">Recommended: 32x32 or 64x64 pixels</p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="glass rounded-3xl p-6 space-y-6">
        <h2 className="text-xl font-bold text-white">Hero Section</h2>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Hero Title</label>
            <input
              type="text"
              value={settings?.hero_title || ""}
              onChange={(e) => setSettings({...settings, hero_title: e.target.value})}
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Hero Subtitle</label>
            <input
              type="text"
              value={settings?.hero_subtitle || ""}
              onChange={(e) => setSettings({...settings, hero_subtitle: e.target.value})}
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white"
            />
          </div>
        </div>
      </div>

      {/* Site Analytics */}
      <div className="glass rounded-3xl p-6 space-y-6">
        <h2 className="text-xl font-bold text-white">Site Analytics</h2>
        <p className="text-sm text-white/70">Control visit tracking and analytics</p>

        <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl">
          <div>
            <p className="font-semibold text-white">Visit Tracking</p>
            <p className="text-sm text-white/50">Turn on when your site goes live to start tracking visits</p>
          </div>
          <label className="relative inline-block w-12 h-6">
            <input
              type="checkbox"
              checked={settings?.visit_tracking_enabled || false}
              onChange={(e) => setSettings({...settings, visit_tracking_enabled: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-slate-700 rounded-full peer peer-checked:bg-yellow-400 transition-colors"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
          </label>
        </div>

        {settings?.visit_tracking_enabled && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-sm text-blue-400 flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>Tip:</strong> Keep tracking disabled during development and testing. Enable it only when your site is ready for production to get accurate visitor statistics.</span>
            </p>
          </div>
        )}

        <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl">
          <div>
            <p className="font-semibold text-white">Reset Visit Counter</p>
            <p className="text-sm text-white/50">Clear all visit history and start counting from zero</p>
          </div>
          <button
            onClick={handleResetVisits}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
          >
            Reset to Zero
          </button>
        </div>
      </div>

      {/* Theme Colors */}
      <div className="glass rounded-3xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Theme Colors</h2>
            <p className="text-sm text-white/70">Customize your site's color scheme</p>
          </div>
          <button
            onClick={handleColorReset}
            className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 text-sm"
          >
            Reset to Defaults
          </button>
        </div>

        {/* Brand Colors */}
        <div>
          <h3 className="text-yellow-400 font-semibold mb-4">Brand Colors</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Primary Color</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={settings?.primary_color || "#fbbf24"}
                  onChange={(e) => setSettings({...settings, primary_color: e.target.value})}
                  className="w-16 h-12 rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={settings?.primary_color || "#fbbf24"}
                  onChange={(e) => setSettings({...settings, primary_color: e.target.value})}
                  className="flex-1 px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white"
                />
              </div>
              <p className="text-xs text-white/50 mt-2">Main brand color used throughout the site</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Secondary Color</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={settings?.secondary_color || "#0b1220"}
                  onChange={(e) => setSettings({...settings, secondary_color: e.target.value})}
                  className="w-16 h-12 rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={settings?.secondary_color || "#0b1220"}
                  onChange={(e) => setSettings({...settings, secondary_color: e.target.value})}
                  className="flex-1 px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white"
                />
              </div>
              <p className="text-xs text-white/50 mt-2">Background and accent color</p>
            </div>
          </div>
        </div>

        {/* Text Colors */}
        <div>
          <h3 className="text-yellow-400 font-semibold mb-4">Text Colors</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Primary Text</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={settings?.text_color || "#ffffff"}
                  onChange={(e) => setSettings({...settings, text_color: e.target.value})}
                  className="w-16 h-12 rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={settings?.text_color || "#ffffff"}
                  onChange={(e) => setSettings({...settings, text_color: e.target.value})}
                  className="flex-1 px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white"
                />
              </div>
              <p className="text-xs text-white/50 mt-2">Main text color for headings and content</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Secondary Text</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={settings?.text_secondary_color || "#94a3b8"}
                  onChange={(e) => setSettings({...settings, text_secondary_color: e.target.value})}
                  className="w-16 h-12 rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={settings?.text_secondary_color || "#94a3b8"}
                  onChange={(e) => setSettings({...settings, text_secondary_color: e.target.value})}
                  className="flex-1 px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white"
                />
              </div>
              <p className="text-xs text-white/50 mt-2">Muted text for descriptions and labels</p>
            </div>
          </div>
        </div>

        {/* Button, Link, Status Colors... (rest of theme colors) */}
      </div>

      {/* EMAIL CONFIGURATION - NEW SECTION */}
      <div className="glass rounded-3xl p-6 space-y-6">
        <h2 className="text-xl font-bold text-white">Email Configuration</h2>
        <p className="text-sm text-white/70">Configure SMTP settings for sending emails (newsletters, notifications)</p>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">SMTP Host</label>
            <input
              type="text"
              value={settings?.email_host || "smtp.gmail.com"}
              onChange={(e) => setSettings({...settings, email_host: e.target.value})}
              placeholder="smtp.gmail.com"
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">SMTP Port</label>
            <input
              type="number"
              value={settings?.email_port || 587}
              onChange={(e) => setSettings({...settings, email_port: parseInt(e.target.value)})}
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl">
          <div>
            <p className="font-semibold text-white">Use TLS</p>
            <p className="text-sm text-white/50">Enable TLS encryption (recommended)</p>
          </div>
          <label className="relative inline-block w-12 h-6">
            <input
              type="checkbox"
              checked={settings?.email_use_tls || false}
              onChange={(e) => setSettings({...settings, email_use_tls: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-slate-700 rounded-full peer peer-checked:bg-yellow-400"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Email Username</label>
            <input
              type="email"
              value={settings?.email_host_user || ""}
              onChange={(e) => setSettings({...settings, email_host_user: e.target.value})}
              placeholder="your-email@gmail.com"
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Email Password</label>
            <input
              type="password"
              value={settings?.email_host_password || ""}
              onChange={(e) => setSettings({...settings, email_host_password: e.target.value})}
              placeholder="App password (16 characters)"
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">From Email</label>
            <input
              type="email"
              value={settings?.email_from_email || ""}
              onChange={(e) => setSettings({...settings, email_from_email: e.target.value})}
              placeholder="noreply@neeste.com"
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">From Name</label>
            <input
              type="text"
              value={settings?.email_from_name || "Neesté"}
              onChange={(e) => setSettings({...settings, email_from_name: e.target.value})}
              placeholder="Neesté"
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white"
            />
          </div>
        </div>

        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <p className="text-sm text-blue-400 flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span><strong>Gmail Setup:</strong> For Gmail, use an App Password instead of your regular password. Generate one at <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="underline">myaccount.google.com/apppasswords</a></span>
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="glass rounded-3xl p-6 space-y-6">
        <h2 className="text-xl font-bold text-white">Contact Information</h2>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Phone</label>
            <input
              type="text"
              value={settings?.phone || ""}
              onChange={(e) => setSettings({...settings, phone: e.target.value})}
              placeholder="+256 777 123456"
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Email</label>
            <input
              type="email"
              value={settings?.email || ""}
              onChange={(e) => setSettings({...settings, email: e.target.value})}
              placeholder="info@neeste.com"
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-white mb-2">Address</label>
          <input
            type="text"
            value={settings?.address || ""}
            onChange={(e) => setSettings({...settings, address: e.target.value})}
            placeholder="Kampala, Uganda"
            className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-white mb-2">Contact Page Description</label>
          <textarea
            value={settings?.contact_description || ""}
            onChange={(e) => setSettings({...settings, contact_description: e.target.value})}
            placeholder="Have questions? We'd love to hear from you."
            rows={3}
            className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white resize-none"
          />
        </div>
      </div>

      {/* Social Media */}
      <div className="glass rounded-3xl p-6 space-y-6">
        <h2 className="text-xl font-bold text-white">Social Media</h2>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Facebook URL</label>
            <input
              type="url"
              value={settings?.facebook_url || ""}
              onChange={(e) => setSettings({...settings, facebook_url: e.target.value})}
              placeholder="https://facebook.com/yourpage"
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Twitter/X URL</label>
            <input
              type="url"
              value={settings?.twitter_url || ""}
              onChange={(e) => setSettings({...settings, twitter_url: e.target.value})}
              placeholder="https://twitter.com/yourhandle"
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-white mb-2">Instagram URL</label>
          <input
            type="url"
            value={settings?.instagram_url || ""}
            onChange={(e) => setSettings({...settings, instagram_url: e.target.value})}
            placeholder="https://instagram.com/yourhandle"
            className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="glass rounded-3xl p-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-6 py-4 bg-yellow-400 text-black font-bold rounded-xl hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
        >
          {saving ? "Saving..." : "✓ Save Changes"}
        </button>
        <p className="text-center text-sm text-white/50 mt-4">
          <strong>Note:</strong> After saving, the page will reload to apply your theme changes across the entire site.
        </p>
      </div>
    </div>
  );
}
