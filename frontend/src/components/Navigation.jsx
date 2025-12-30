import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navigation({ settings }) {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  
  const isActive = (path) => location.pathname === path;
  
  // Set favicon dynamically
  useEffect(() => {
    if (settings?.favicon_url) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = settings.favicon_url;
    }
  }, [settings?.favicon_url]);
  
  // Get cart count
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(savedCart.reduce((sum, item) => sum + item.qty, 0));
  }, []);

  const primaryColor = settings?.primary_color || "#f59e0b";
  
  const navLinkClass = (path) => `
    px-4 py-2 rounded-xl transition-all
    ${isActive(path) 
      ? 'bg-white/20 text-white font-semibold' 
      : 'text-white/70 hover:text-white hover:bg-white/10'
    }
  `;
  
  return (
    <nav className="glass rounded-2xl px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3">
        {settings?.logo_url ? (
          <img 
            src={settings.logo_url} 
            alt={settings.site_title || "Neesté"} 
            className="h-10 w-auto object-contain"
          />
        ) : (
          <div className="text-xl font-bold">{settings?.site_title || "Neesté"}</div>
        )}
      </Link>
      
      {/* Nav Links */}
      <div className="flex items-center gap-2">
        <Link to="/" className={navLinkClass("/")}>
          Shop
        </Link>
        <Link to="/blog" className={navLinkClass("/blog")}>
          Blog
        </Link>
        <Link to="/contact" className={navLinkClass("/contact")}>
          Contact
        </Link>
        
        {/* Cart Link */}
        <Link to="/checkout" className="relative ml-4 px-4 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all">
          Cart
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
        
        {/* Sign In Button */}
        <Link 
          to="/admin/login" 
          style={{ 
            background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}dd)` 
          }}
          className="ml-4 px-6 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity shadow-lg"
        >
          Sign In
        </Link>
      </div>
    </nav>
  );
}