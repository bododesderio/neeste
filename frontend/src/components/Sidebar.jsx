import React from "react";
import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `block px-4 py-2 rounded-lg ${isActive ? "bg-white/10" : "hover:bg-white/5"}`;

export default function Sidebar({ onLogout }) {
  return (
    <aside className="w-72 p-4 bg-slate-900/50 border-r border-white/10">
      <div className="glass rounded-2xl p-4 mb-4">
        <div className="text-xl font-semibold">Neesté Admin</div>
        <div className="text-sm text-white/70">Configure site in one place</div>
      </div>

      <nav className="space-y-2">
        <NavLink to="/admin/settings" className={linkClass}>Settings</NavLink>
        <NavLink to="/admin/products" className={linkClass}>Products</NavLink>
        <NavLink to="/admin/orders" className={linkClass}>Orders</NavLink>
        <NavLink to="/admin/newsletter" className={linkClass}>Newsletter</NavLink>
      </nav>

      <button
        onClick={onLogout}
        className="mt-6 w-full px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30"
      >
        Logout
      </button>

      <div className="mt-6 text-xs text-white/60">
        Tip: Mark orders as <b>PAID</b> to unlock cookbook download.
      </div>
    </aside>
  );
}
