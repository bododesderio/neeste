import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api.js";

export default function NotificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotification();
  }, [id]);

  async function fetchNotification() {
    try {
      const res = await api.get(`/admin/notifications/${id}/`);
      setNotification(res.data);
      
      // Mark as read if not already
      if (!res.data.read) {
        await api.patch(`/admin/notifications/${id}/`, { read: true });
      }
    } catch (error) {
      console.error("Failed to fetch notification:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this notification?")) return;
    
    try {
      await api.delete(`/admin/notifications/${id}/`);
      navigate("/admin/dashboard");
    } catch (error) {
      alert("Failed to delete notification");
    }
  }

  function getIcon() {
    switch (notification?.type) {
      case "order":
        return (
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        );
      case "contact":
        return (
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
        );
      case "newsletter":
        return (
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        );
    }
  }

  function getBadgeColor() {
    switch (notification?.type) {
      case "order": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "contact": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "newsletter": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default: return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-white/70">Loading...</div>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="p-6">
        <div className="glass rounded-3xl p-8 text-center">
          <p className="text-white/70 mb-4">Notification not found</p>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="px-6 py-2 bg-yellow-400 text-black rounded-xl hover:bg-yellow-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-3xl font-bold text-white">Notification Details</h1>
      </div>

      {/* Notification Card */}
      <div className="glass rounded-3xl p-8 space-y-6">
        {/* Header with Icon */}
        <div className="flex items-start gap-6">
          {getIcon()}
          
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h2 className="text-2xl font-bold text-white">{notification.title}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeColor()} uppercase`}>
                {notification.type}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-white/50">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(notification.created_at).toLocaleString()}
              </span>
              
              {notification.read ? (
                <span className="flex items-center gap-1 text-green-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Read
                </span>
              ) : (
                <span className="flex items-center gap-1 text-yellow-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                  Unread
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10"></div>

        {/* Message */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Message</h3>
          <div className="bg-slate-900 rounded-xl p-6 text-white/90 leading-relaxed">
            {notification.message}
          </div>
        </div>

        {/* Action Button */}
        {notification.link && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Quick Action</h3>
            <button
              onClick={() => navigate(notification.link)}
              className="w-full px-6 py-4 bg-yellow-400 text-black font-semibold rounded-xl hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2"
            >
              View Related Item
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={handleDelete}
            className="flex-1 px-6 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors font-semibold"
          >
            Delete Notification
          </button>
          
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex-1 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
