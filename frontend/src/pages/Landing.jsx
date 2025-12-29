import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import Navigation from "../components/Navigation.jsx";
import Footer from "../components/Footer.jsx";

export default function Landing() {
  const navigate = useNavigate();
  const [boot, setBoot] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Load bootstrap data
    api.get("/public/bootstrap/").then(res => setBoot(res.data));
    
    // Load cart from localStorage
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  const settings = boot?.settings || {};
  const allProducts = boot?.products || [];
  
  // Split products by type
  const eggs = allProducts.filter(p => p.type === "PHYSICAL");
  const cookbooks = allProducts.filter(p => p.type === "DIGITAL");

  const bgColor = settings?.secondary_color || "#0b1220";
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div style={{ background: bgColor }} className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Navigation settings={settings} />

        {/* Hero Section */}
        <section className="mt-10 glass rounded-3xl p-8 md:p-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            {settings.hero_title || "Fresh Eggs & Digital Cookbooks"}
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
            {settings.hero_subtitle || "Order farm-fresh eggs and download cookbooks instantly."}
          </p>

          {/* Cart Button */}
          {cart.length > 0 && (
            <button
              onClick={() => navigate("/checkout")}
              className="mt-8 relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition-colors shadow-lg hover:shadow-xl"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Proceed to Checkout ({cartCount} item{cartCount !== 1 ? 's' : ''})
              <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-bold animate-pulse">
                {cart.length}
              </span>
            </button>
          )}
        </section>

        {/* Fresh Raw Eggs Section */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-yellow-400">Fresh Raw Eggs</h2>
              <p className="text-white/70 mt-2">Farm-fresh eggs delivered to your door</p>
            </div>
          </div>

          {eggs.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-white/70">No eggs available yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {eggs.map(p => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/product/${p.id}`)}
                  className="glass rounded-3xl overflow-hidden hover:scale-105 transition-transform cursor-pointer group"
                >
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                      <svg className="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="p-5">
                    <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-yellow-400 transition-colors">
                      {p.name}
                    </h3>
                    <p className="mt-2 text-sm text-white/70 line-clamp-2">{p.description}</p>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-yellow-400">
                          {Number(p.price).toLocaleString()}
                        </span>
                        <span className="text-sm text-white/60 ml-1">{p.currency}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <span className="inline-block px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs">
                        Physical Delivery
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Boiled Eggs Section */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-yellow-400">Fresh Boiled Eggs</h2>
              <p className="text-white/70 mt-2">Fresh boiled eggs delivered to your door</p>
            </div>
          </div>

          {eggs.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-white/70">No eggs available yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {eggs.map(p => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/product/${p.id}`)}
                  className="glass rounded-3xl overflow-hidden hover:scale-105 transition-transform cursor-pointer group"
                >
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                      <svg className="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="p-5">
                    <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-yellow-400 transition-colors">
                      {p.name}
                    </h3>
                    <p className="mt-2 text-sm text-white/70 line-clamp-2">{p.description}</p>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-yellow-400">
                          {Number(p.price).toLocaleString()}
                        </span>
                        <span className="text-sm text-white/60 ml-1">{p.currency}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <span className="inline-block px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs">
                        Physical Delivery
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Digital Cookbooks Section */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-yellow-400">Cookbooks</h2>
              <p className="text-white/70 mt-2">Instant download after purchase</p>
            </div>
          </div>

          {cookbooks.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-white/70">No cookbooks available yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cookbooks.map(p => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/product/${p.id}`)}
                  className="glass rounded-3xl overflow-hidden hover:scale-105 transition-transform cursor-pointer group"
                >
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <svg className="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="p-5">
                    <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-yellow-400 transition-colors">
                      {p.name}
                    </h3>
                    <p className="mt-2 text-sm text-white/70 line-clamp-2">{p.description}</p>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-yellow-400">
                          {Number(p.price).toLocaleString()}
                        </span>
                        <span className="text-sm text-white/60 ml-1">{p.currency}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <span className="inline-block px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs">
                        Instant Download
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <Footer settings={settings} />
      </div>
    </div>
  );
}
