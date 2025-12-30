import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../api.js";

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading
  const token = localStorage.getItem("access");

  useEffect(() => {
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    // Verify token
    api
      .get("/admin/profile/me/")
      .then(() => setIsAuthenticated(true))
      .catch(() => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setIsAuthenticated(false);
      });
  }, [token]);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-yellow-400"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}
