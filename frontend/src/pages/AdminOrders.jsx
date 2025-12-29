import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const res = await api.get("/admin/orders/");
      setOrders(res.data);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    load(); 
  }, []);

  async function markPaid(id) {
    try {
      await api.post(`/admin/orders/${id}/mark-paid/`);
      load();
    } catch (error) {
      console.error("Failed to mark as paid:", error);
      alert("Failed to mark order as paid. Please try again.");
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-white">Orders</h1>
        <div className="mt-8 text-center text-white/60">Loading orders...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Orders</h1>
          <p className="text-white/70 text-sm mt-1">
            Mark PAID to unlock cookbook download tokens.
          </p>
        </div>
        {orders.length > 0 && (
          <div className="px-4 py-2 rounded-xl bg-yellow-400/10 border border-yellow-400/30">
            <span className="text-sm text-yellow-400 font-semibold">
              {orders.length} order{orders.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        /* Empty State */
        <div className="glass rounded-3xl p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto rounded-full bg-yellow-400/10 flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">No orders yet</h3>
            <p className="text-white/60 mb-6">
              Orders will appear here when customers make purchases through your store.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => navigate("/admin/products")}
                className="w-full px-6 py-3 rounded-xl bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Products
              </button>

              <button
                onClick={() => window.open("/", "_blank")}
                className="w-full px-6 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Store
              </button>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-start gap-3 text-left">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-200">
                  <strong>Tip:</strong> Make sure you have products listed and MTN MoMo configured before expecting orders.
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="glass rounded-3xl p-6 hover:bg-white/5 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-lg text-white">{o.reference}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      o.status === "PAID" 
                        ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    }`}>
                      {o.status}
                    </span>
                  </div>
                  
                  <div className="text-white/80 mb-1">
                    <svg className="w-4 h-4 inline mr-2 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {o.full_name}
                  </div>
                  
                  <div className="text-sm text-white/60">
                    <svg className="w-4 h-4 inline mr-2 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {o.phone}
                    {o.email && (
                      <>
                        <span className="mx-2">•</span>
                        <svg className="w-4 h-4 inline mr-2 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {o.email}
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-400 mb-2">
                    {Number(o.total_amount).toLocaleString()} UGX
                  </div>
                  {o.status !== "PAID" && (
                    <button 
                      onClick={() => markPaid(o.id)} 
                      className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors font-medium text-sm"
                    >
                      Mark as Paid
                    </button>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-sm font-medium text-white/80 mb-2">Order Items:</div>
                <div className="space-y-2">
                  {o.items.map(it => (
                    <div key={it.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-white">{it.product_name}</span>
                        <span className="px-2 py-0.5 rounded bg-white/10 text-xs text-white/60">
                          x{it.qty}
                        </span>
                      </div>
                      <span className="text-white/80">
                        {Number(it.unit_price).toLocaleString()} UGX
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* MoMo Reference if available */}
              {o.momo_reference_id && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-xs text-white/60">
                    MoMo Reference: <span className="font-mono text-white/80">{o.momo_reference_id}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
