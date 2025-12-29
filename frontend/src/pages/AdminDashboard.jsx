import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/admin/dashboard/");
      setData(res.data);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.response?.data?.detail || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-3xl p-8">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <button
            onClick={fetchDashboard}
            className="px-6 py-2 rounded-xl bg-yellow-400 text-black font-semibold hover:bg-yellow-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const quickActions = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      label: "Create Product",
      onClick: () => navigate("/admin/products"),
      color: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/30"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      label: "New Blog Post",
      onClick: () => navigate("/admin/blog"),
      color: "bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/30"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      label: "View Orders",
      onClick: () => navigate("/admin/orders"),
      color: "bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/30"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: "Site Settings",
      onClick: () => navigate("/admin/settings"),
      color: "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-white/60">Total Revenue</div>
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-white">
            {Number(data.revenue?.total || 0).toLocaleString()}
            <span className="text-lg text-white/60 ml-2">{data.revenue?.currency || "UGX"}</span>
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-white/60">Total Orders</div>
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-white">{data.orders?.total || 0}</div>
          <div className="text-sm text-white/60 mt-2">
            {data.orders?.paid || 0} paid • {data.orders?.pending || 0} pending
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-white/60">Site Visits</div>
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-white">{data.site_visits?.total || 0}</div>
          <div className="text-sm text-white/60 mt-2">Last 30 days</div>
        </div>

        <div className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-white/60">Blog Posts</div>
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-white">{data.blog?.published || 0}</div>
          <div className="text-sm text-white/60 mt-2">
            {data.blog?.total || 0} total
          </div>
        </div>
      </div>

      {/* Site Visits Chart */}
      {data.site_visits?.data && data.site_visits.data.length > 0 && (
        <div className="glass rounded-3xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Site Visits (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.site_visits.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#fbbf24"
                strokeWidth={2}
                dot={{ fill: "#fbbf24" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recents & Quick Actions Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="glass rounded-3xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
          
          <div className="space-y-4">
            {/* Recent Orders */}
            {data.recent_orders && data.recent_orders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => navigate("/admin/orders")}
              >
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">New order {order.reference}</div>
                  <div className="text-xs text-white/60 truncate">{order.full_name}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-semibold text-yellow-400">
                    {Number(order.total_amount).toLocaleString()}
                  </div>
                  <div className={`text-xs ${order.status === "PAID" ? "text-green-400" : "text-yellow-400"}`}>
                    {order.status}
                  </div>
                </div>
              </div>
            ))}

            {/* Unread Contacts */}
            {data.contacts?.unread > 0 && (
              <div
                className="flex items-start gap-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 transition-colors cursor-pointer"
                onClick={() => navigate("/admin/contacts")}
              >
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">
                    {data.contacts.unread} unread message{data.contacts.unread !== 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-white/60">Click to view contact submissions</div>
                </div>
              </div>
            )}

            {(!data.recent_orders || data.recent_orders.length === 0) && (!data.contacts?.unread) && (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-white/20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-sm text-white/40">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass rounded-3xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className={`p-4 rounded-xl border transition-all hover:scale-105 ${action.color}`}
              >
                <div className="flex flex-col items-center gap-3">
                  {action.icon}
                  <span className="text-sm font-medium">{action.label}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Additional Actions */}
          <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
            <button
              onClick={() => navigate("/admin/newsletter")}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-white">Newsletter Subscribers</span>
              </div>
              <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="text-sm text-white">View Live Site</span>
              </div>
              <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Product Sales */}
      {data.product_sales && data.product_sales.length > 0 && (
        <div className="glass rounded-3xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Top Selling Products</h2>
          <div className="space-y-4">
            {data.product_sales.slice(0, 10).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-semibold text-sm">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="text-white font-medium">{item.product__name}</div>
                    <div className="text-sm text-white/60">{item.quantity_sold} sold</div>
                  </div>
                </div>
                <div className="text-yellow-400 font-semibold">
                  {Number(item.revenue).toLocaleString()} UGX
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
