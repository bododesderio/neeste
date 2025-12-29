import React, { Fragment, useState, useEffect } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

export default function ProfileDropdown({ onLogout }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Fetch current user info
    async function fetchUser() {
      try {
        const response = await api.get("/admin/profile/me/");
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    }
    fetchUser();
  }, []);
  
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-700 transition-colors">
        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-semibold text-sm">
          {user?.username?.charAt(0).toUpperCase() || "A"}
        </div>
        <span className="text-sm text-white hidden md:block">{user?.username || "Admin"}</span>
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden z-50">
          <div className="p-3 border-b border-slate-700">
            <div className="text-sm font-semibold text-white">{user?.username || "Admin"}</div>
            <div className="text-xs text-slate-400">{user?.email || "admin@neeste.local"}</div>
          </div>

          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => navigate("/admin/profile")}
                  className={`${
                    active ? "bg-slate-700" : ""
                  } flex w-full items-center gap-3 px-4 py-2 text-sm text-white`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Edit Profile
                </button>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onLogout}
                  className={`${
                    active ? "bg-red-500/10" : ""
                  } flex w-full items-center gap-3 px-4 py-2 text-sm text-red-400`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
