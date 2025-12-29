import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAuth } from "../api.js";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login/", {
        username: form.username,
        password: form.password,
      });

      if (res.data.access && res.data.refresh) {
        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);
        
        // IMPORTANT: Set auth header immediately
        setAuth(res.data.access);
        
        navigate("/admin/dashboard");
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.detail || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md glass rounded-3xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-yellow-400"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-yellow-400"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-2xl bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 mb-2">For authorized personnel only
          </p>
          <a href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
