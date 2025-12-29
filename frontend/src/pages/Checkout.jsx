import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useTheme } from "../hooks/useTheme.js";
import Navigation from "../components/Navigation.jsx";
import Footer from "../components/Footer.jsx";

export default function Checkout() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", address: "" });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load settings
    api.get("/public/bootstrap/").then(res => setSettings(res.data.settings));
    
    // Load cart
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (savedCart.length === 0) {
      navigate("/");
    }
    setCart(savedCart);
  }, [navigate]);

  // Apply theme colors globally
  useTheme(settings);

  const bgColor = settings?.secondary_color || "#0b1220";
  const total = cart.reduce((sum, it) => sum + (Number(it.price) * it.qty), 0);

  function normalizeMsisdn(phone) {
    let p = (phone || "").trim().replace(/\s+/g, "");
    if (!p) return "";
    if (p.startsWith("+")) p = p.slice(1);
    if (p.startsWith("0") && p.length >= 10) p = "256" + p.slice(1);
    return p;
  }

  async function handlePayment(e) {
    e.preventDefault();
    setError("");

    if (!form.full_name || !form.phone) {
      setError("Name and phone are required.");
      return;
    }

    const msisdn = normalizeMsisdn(form.phone);
    if (!msisdn || !msisdn.startsWith("256")) {
      setError("Enter a valid UG phone number (e.g. 0777xxxxxx or 256777xxxxxx).");
      return;
    }

    setProcessing(true);

    try {
      // Create order
      const payload = {
        ...form,
        items: cart.map(x => ({ product: x.id, qty: x.qty })),
      };

      const orderRes = await api.post("/public/orders/", payload);
      const orderId = orderRes?.data?.id;
      const orderRef = orderRes?.data?.reference;

      if (!orderId) {
        setError("Failed to create order. Please try again.");
        setProcessing(false);
        return;
      }

      // Initiate MoMo payment
      const payRes = await api.post("/public/momo/initiate/", {
        order_id: orderId,
        payer_msisdn: msisdn,
      });

      const referenceId = payRes?.data?.reference_id;
      if (!referenceId) {
        setError("Failed to initiate payment. Please try again.");
        setProcessing(false);
        return;
      }

      // Clear cart and navigate to success page with reference
      localStorage.removeItem("cart");
      navigate(`/payment/success?ref=${referenceId}&order=${orderRef}`);
    } catch (err) {
      console.error("Payment error:", err);
      setError("Payment failed. Please try again.");
      setProcessing(false);
    }
  }

  function changeQty(id, delta) {
    const newCart = cart
      .map(x => (x.id === id ? { ...x, qty: Math.max(1, x.qty + delta) } : x))
      .filter(x => x.qty > 0);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  }

  function removeItem(id) {
    const newCart = cart.filter(x => x.id !== id);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    if (newCart.length === 0) {
      navigate("/");
    }
  }

  if (!cart || cart.length === 0) {
    return (
      <div style={{ background: bgColor }} className="min-h-screen text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Navigation settings={settings} />
          <div className="mt-20 text-center">
            <h1 className="text-3xl font-bold">Your cart is empty</h1>
            <button
              onClick={() => navigate("/")}
              className="mt-6 btn-primary"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: bgColor }} className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Navigation settings={settings} />

        <div className="mt-10">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2 space-y-4">
              <div className="glass rounded-3xl p-6">
                <h2 className="text-xl font-bold mb-4">Order Items</h2>
                
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-xl"
                        />
                      )}
                      
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-white/60 mt-1">
                          {Number(item.price).toLocaleString()} UGX each
                        </p>
                        <span className="inline-block mt-2 px-2 py-1 rounded text-xs bg-yellow-400/20 text-yellow-400">
                          {item.type === "DIGITAL" ? "📥 Digital" : "📦 Physical"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          disabled={processing}
                          onClick={() => changeQty(item.id, -1)}
                          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-semibold">{item.qty}</span>
                        <button
                          disabled={processing}
                          onClick={() => changeQty(item.id, 1)}
                          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50"
                        >
                          +
                        </button>
                        <button
                          disabled={processing}
                          onClick={() => removeItem(item.id)}
                          className="ml-2 p-2 rounded-lg hover:bg-red-500/20 text-red-400 disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-yellow-400">
                          {(Number(item.price) * item.qty).toLocaleString()} UGX
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="lg:col-span-1">
              <div className="glass rounded-3xl p-6 sticky top-6">
                <h2 className="text-xl font-bold mb-4">Payment Details</h2>

                <div className="mb-6 p-4 rounded-2xl bg-yellow-400/10 border border-yellow-400/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70">Subtotal</span>
                    <span>{total.toLocaleString()} UGX</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold text-yellow-400">
                      {total.toLocaleString()} UGX
                    </span>
                  </div>
                </div>

                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-yellow-400"
                      required
                      disabled={processing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/70 mb-2">Phone Number (MTN) *</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="0777xxxxxx"
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-yellow-400"
                      required
                      disabled={processing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/70 mb-2">Email (optional)</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-yellow-400"
                      disabled={processing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/70 mb-2">
                      Delivery Address {cart.some(x => x.type === "PHYSICAL") && "*"}
                    </label>
                    <textarea
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-yellow-400"
                      required={cart.some(x => x.type === "PHYSICAL")}
                      disabled={processing}
                    />
                  </div>

                  {error && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-4 rounded-2xl bg-yellow-400 text-black font-semibold text-lg hover:bg-yellow-500 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Pay with MTN MoMo
                      </>
                    )}
                  </button>

                  <p className="text-xs text-center text-white/60">
                    You'll receive a prompt on your phone to approve the payment
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <Footer settings={settings} />
        </div>
      </div>
    </div>
  );
}
