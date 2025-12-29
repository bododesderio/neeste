import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useTheme } from "../hooks/useTheme.js";
import Navigation from "../components/Navigation.jsx";
import Footer from "../components/Footer.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    Promise.all([
      api.get("/public/bootstrap/"),
      api.get(`/public/products/${id}/`)
    ]).then(([bootRes, productRes]) => {
      setSettings(bootRes.data.settings);
      setProduct(productRes.data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [id]);

  // Apply theme colors globally
  useTheme(settings);

  const bgColor = settings?.secondary_color || "#0b1220";

  function addToCart() {
    // Get existing cart from localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    
    // Check if product already in cart
    const existingIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingIndex >= 0) {
      // Update quantity
      cart[existingIndex].qty += quantity;
    } else {
      // Add new item
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        qty: quantity,
        type: product.type,
        image_url: product.image_url
      });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    
    // Navigate to checkout
    navigate("/checkout");
  }

  if (loading) {
    return (
      <div style={{ background: bgColor }} className="min-h-screen flex items-center justify-center text-white">
        <div>Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ background: bgColor }} className="min-h-screen text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Navigation settings={settings} />
          <div className="mt-20 text-center">
            <h1 className="text-3xl font-bold">Product Not Found</h1>
            <button
              onClick={() => navigate("/")}
              className="mt-6 btn-primary"
            >
              Back to Home
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

        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="mt-6 flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </button>

        {/* Product Detail */}
        <div className="mt-10 grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="glass rounded-3xl overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                <svg className="w-32 h-32 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <div className="inline-block px-3 py-1 rounded-lg bg-yellow-400/20 text-yellow-400 text-sm w-fit mb-4">
              {product.type === "DIGITAL" ? "📥 Digital Product" : "📦 Physical Product"}
            </div>

            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-5xl font-bold text-yellow-400">
                {Number(product.price).toLocaleString()}
              </span>
              <span className="text-xl text-white/60">{product.currency}</span>
            </div>

            <div className="prose prose-invert mb-8">
              <p className="text-lg text-white/80 leading-relaxed">
                {product.description || "No description available."}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm text-white/70 mb-2">Quantity</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl font-semibold transition-colors"
                >
                  −
                </button>
                <span className="text-2xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl font-semibold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="glass rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Total</span>
                <span className="text-3xl font-bold text-yellow-400">
                  {(Number(product.price) * quantity).toLocaleString()} {product.currency}
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={addToCart}
              className="w-full py-4 rounded-2xl bg-yellow-400 text-black text-lg font-semibold hover:bg-yellow-500 transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Add to Cart
            </button>

            {/* Product Type Info */}
            <div className="mt-6 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-200">
                  {product.type === "DIGITAL" ? (
                    <>
                      <strong>Digital Product:</strong> You will receive a download link immediately after payment is confirmed.
                    </>
                  ) : (
                    <>
                      <strong>Physical Product:</strong> Our admin will review your order and arrange delivery. You'll be contacted for delivery details.
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20">
          <Footer settings={settings} />
        </div>
      </div>
    </div>
  );
}
