import React, { useState, useEffect } from "react";
import { api } from "../api.js";

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    try {
      setLoading(true);
      const res = await api.get("/admin/contacts/");
      setContacts(res.data);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id) {
    try {
      await api.post(`/admin/contacts/${id}/mark-read/`);
      fetchContacts();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-white/70">Loading contacts...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Contact Submissions</h1>
        <p className="text-white/70 text-sm">Manage customer inquiries and messages</p>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm text-white/70 font-semibold">Name</th>
                <th className="text-left p-4 text-sm text-white/70 font-semibold">Email</th>
                <th className="text-left p-4 text-sm text-white/70 font-semibold">Subject</th>
                <th className="text-left p-4 text-sm text-white/70 font-semibold">Message</th>
                <th className="text-left p-4 text-sm text-white/70 font-semibold">Date</th>
                <th className="text-left p-4 text-sm text-white/70 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-white/50">
                    No contact submissions yet
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                      !contact.read ? "bg-yellow-400/5" : ""
                    }`}
                  >
                    <td className="p-4 text-white text-sm">{contact.name}</td>
                    <td className="p-4 text-white/70 text-sm">{contact.email}</td>
                    <td className="p-4 text-white/70 text-sm">{contact.subject || "No subject"}</td>
                    <td className="p-4 text-white/70 text-sm max-w-xs truncate">{contact.message}</td>
                    <td className="p-4 text-white/70 text-sm">
                      {new Date(contact.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {contact.read ? (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-xl text-xs font-semibold">
                          Read
                        </span>
                      ) : (
                        <button
                          onClick={() => markAsRead(contact.id)}
                          className="px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-xl text-xs font-semibold hover:bg-yellow-400/30 transition-colors"
                        >
                          Mark as Read
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
