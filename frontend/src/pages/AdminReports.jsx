import React, { useState, useEffect } from "react";
import { api } from "../api.js";

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState("sales");
  const [dateRange, setDateRange] = useState("30");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [salesData, setSalesData] = useState(null);
  const [productsData, setProductsData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [dateRange, startDate, endDate]);

  async function fetchReports() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (dateRange === "custom" && startDate && endDate) {
        params.append("start_date", startDate);
        params.append("end_date", endDate);
      } else {
        params.append("days", dateRange);
      }

      const [salesRes, productsRes] = await Promise.all([
        api.get(`/admin/reports/sales/?${params}`),
        api.get(`/admin/reports/products/?${params}`)
      ]);

      setSalesData(salesRes.data);
      setProductsData(productsRes.data);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  }

  function exportCSV(type) {
    const data = type === "sales" ? salesData : productsData;
    if (!data) return;

    let csv = "";
    
    if (type === "sales") {
      csv = "Date,Revenue,Orders,Avg Order Value\n";
      data.daily_revenue?.forEach(item => {
        csv += `${item.date},${item.total_revenue},${item.order_count},${item.avg_order_value}\n`;
      });
    } else {
      csv = "Product,Quantity Sold,Revenue,Type\n";
      data.top_products?.forEach(item => {
        csv += `"${item.name}",${item.quantity_sold},${item.total_revenue},"${item.product_type}"\n`;
      });
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount || 0);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
        <p className="text-white/70 text-sm">Track your business performance and insights</p>
      </div>

      {/* Date Range Selector */}
      <div className="glass rounded-3xl p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-white mb-2">Time Period</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateRange === "custom" && (
            <>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold text-white mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white"
                />
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold text-white mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="glass rounded-3xl p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("sales")}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === "sales"
                ? "bg-yellow-400 text-black"
                : "text-white hover:bg-white/10"
            }`}
          >
            💰 Sales Report
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === "products"
                ? "bg-yellow-400 text-black"
                : "text-white hover:bg-white/10"
            }`}
          >
            📦 Product Performance
          </button>
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === "overview"
                ? "bg-yellow-400 text-black"
                : "text-white hover:bg-white/10"
            }`}
          >
            📈 Overview
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass rounded-3xl p-12 text-center">
          <div className="text-white/70">Loading reports...</div>
        </div>
      ) : (
        <>
          {/* Sales Report */}
          {activeTab === "sales" && salesData && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-white/70">Total Revenue</h3>
                  </div>
                  <p className="text-3xl font-bold text-white">{formatCurrency(salesData.total_revenue)}</p>
                </div>

                <div className="glass rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-white/70">Total Orders</h3>
                  </div>
                  <p className="text-3xl font-bold text-white">{salesData.total_orders}</p>
                  <p className="text-sm text-white/50 mt-2">
                    {salesData.paid_orders} paid • {salesData.pending_orders} pending
                  </p>
                </div>

                <div className="glass rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-white/70">Avg Order Value</h3>
                  </div>
                  <p className="text-3xl font-bold text-white">{formatCurrency(salesData.avg_order_value)}</p>
                </div>

                <div className="glass rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-white/70">Conversion Rate</h3>
                  </div>
                  <p className="text-3xl font-bold text-white">{salesData.conversion_rate?.toFixed(1)}%</p>
                </div>
              </div>

              {/* Daily Revenue Chart */}
              <div className="glass rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Revenue Over Time</h3>
                  <button
                    onClick={() => exportCSV("sales")}
                    className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors text-sm font-semibold"
                  >
                    📥 Export CSV
                  </button>
                </div>

                {salesData.daily_revenue && salesData.daily_revenue.length > 0 ? (
                  <div className="space-y-3">
                    {salesData.daily_revenue.map((day, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-24 text-sm text-white/70">
                          {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex-1 h-12 bg-slate-900 rounded-xl overflow-hidden relative">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                            style={{
                              width: `${(day.total_revenue / Math.max(...salesData.daily_revenue.map(d => d.total_revenue))) * 100}%`
                            }}
                          ></div>
                          <div className="absolute inset-0 flex items-center px-4">
                            <span className="text-sm font-semibold text-white">
                              {formatCurrency(day.total_revenue)} • {day.order_count} orders
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-white/50">
                    No sales data for this period
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Products Report */}
          {activeTab === "products" && productsData && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-white/70">Total Products Sold</h3>
                  </div>
                  <p className="text-3xl font-bold text-white">{productsData.total_quantity_sold}</p>
                </div>

                <div className="glass rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-white/70">Product Revenue</h3>
                  </div>
                  <p className="text-3xl font-bold text-white">{formatCurrency(productsData.total_product_revenue)}</p>
                </div>

                <div className="glass rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-white/70">Unique Products</h3>
                  </div>
                  <p className="text-3xl font-bold text-white">{productsData.top_products?.length || 0}</p>
                </div>
              </div>

              {/* Top Products Table */}
              <div className="glass rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Best Selling Products</h3>
                  <button
                    onClick={() => exportCSV("products")}
                    className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors text-sm font-semibold"
                  >
                    📥 Export CSV
                  </button>
                </div>

                {productsData.top_products && productsData.top_products.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-white/70">Rank</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-white/70">Product</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-white/70">Type</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-white/70">Qty Sold</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-white/70">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productsData.top_products.map((product, idx) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4">
                              <div className="w-8 h-8 rounded-lg bg-yellow-400 text-black flex items-center justify-center font-bold">
                                {idx + 1}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-semibold text-white">{product.name}</p>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                product.product_type === 'physical' 
                                  ? 'bg-blue-500/20 text-blue-400' 
                                  : 'bg-purple-500/20 text-purple-400'
                              }`}>
                                {product.product_type}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <p className="font-semibold text-white">{product.quantity_sold}</p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <p className="font-semibold text-white">{formatCurrency(product.total_revenue)}</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-white/50">
                    No product data for this period
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Overview Report */}
          {activeTab === "overview" && salesData && productsData && (
            <div className="space-y-6">
              <div className="glass rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Executive Summary</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-yellow-400">Sales Performance</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/70">Total Revenue:</span>
                        <span className="font-semibold text-white">{formatCurrency(salesData.total_revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Total Orders:</span>
                        <span className="font-semibold text-white">{salesData.total_orders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Average Order:</span>
                        <span className="font-semibold text-white">{formatCurrency(salesData.avg_order_value)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Paid Orders:</span>
                        <span className="font-semibold text-green-400">{salesData.paid_orders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Pending Orders:</span>
                        <span className="font-semibold text-yellow-400">{salesData.pending_orders}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-yellow-400">Product Performance</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/70">Units Sold:</span>
                        <span className="font-semibold text-white">{productsData.total_quantity_sold}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Product Revenue:</span>
                        <span className="font-semibold text-white">{formatCurrency(productsData.total_product_revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Active Products:</span>
                        <span className="font-semibold text-white">{productsData.top_products?.length || 0}</span>
                      </div>
                      {productsData.top_products && productsData.top_products[0] && (
                        <>
                          <div className="pt-3 border-t border-white/10">
                            <span className="text-white/70">Top Product:</span>
                            <p className="font-semibold text-white mt-1">{productsData.top_products[0].name}</p>
                            <p className="text-sm text-white/50">{productsData.top_products[0].quantity_sold} sold</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
