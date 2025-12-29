import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navigation({ settings }) {
  const location = useLocation();
  
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
        
        {/* Sign In Button - Uses dynamic primary color */}
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