import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { api } from "../api.js";

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [selectedSubscribers, setSelectedSubscribers] = useState([]);
  const [activeTab, setActiveTab] = useState("subscribers");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [subsRes, campaignsRes] = await Promise.all([
        api.get("/admin/newsletter/"),
        api.get("/admin/email-campaigns/"),
      ]);
      setSubscribers(subsRes.data);
      setCampaigns(campaignsRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendTest() {
    if (!subject || !content) {
      alert("Subject and content are required!");
      return;
    }
    
    if (!window.confirm("Send test email to your admin email?")) return;
    
    try {
      setSending(true);
      const res = await api.post("/admin/send-test-email/", { subject, content });
      alert(res.data.detail);
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to send test email");
    } finally {
      setSending(false);
    }
  }

  async function handleSendNewsletter() {
    if (!subject || !content) {
      alert("Subject and content are required!");
      return;
    }
    
    const recipientCount = selectedSubscribers.length || subscribers.length;
    const message = selectedSubscribers.length
      ? `Send to ${recipientCount} selected subscribers?`
      : `Send to ALL ${recipientCount} subscribers?`;
    
    if (!window.confirm(message)) return;
    
    try {
      setSending(true);
      const res = await api.post("/admin/send-newsletter/", {
        subject,
        content,
        recipient_ids: selectedSubscribers,
      });
      alert(res.data.detail);
      
      setSubject("");
      setContent("");
      setSelectedSubscribers([]);
      fetchData();
      setActiveTab("campaigns");
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to send newsletter");
    } finally {
      setSending(false);
    }
  }

  function toggleSubscriber(id) {
    setSelectedSubscribers(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  }

  function toggleAllSubscribers() {
    if (selectedSubscribers.length === subscribers.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(subscribers.map(s => s.id));
    }
  }

  if (loading) {
    return <div className="p-6 text-white/70">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Newsletter</h1>
          <p className="text-white/70 text-sm">Manage subscribers and send email campaigns</p>
        </div>
        <button
          onClick={() => setActiveTab("compose")}
          className="px-6 py-3 bg-yellow-400 text-black rounded-xl font-semibold hover:bg-yellow-300 transition-colors"
        >
          Compose Email
        </button>
      </div>

      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab("subscribers")}
          className={`px-4 py-2 font-semibold ${
            activeTab === "subscribers"
              ? "text-yellow-400 border-b-2 border-yellow-400"
              : "text-white/50 hover:text-white/70"
          }`}
        >
          Subscribers ({subscribers.length})
        </button>
        <button
          onClick={() => setActiveTab("compose")}
          className={`px-4 py-2 font-semibold ${
            activeTab === "compose"
              ? "text-yellow-400 border-b-2 border-yellow-400"
              : "text-white/50 hover:text-white/70"
          }`}
        >
          Compose
        </button>
        <button
          onClick={() => setActiveTab("campaigns")}
          className={`px-4 py-2 font-semibold ${
            activeTab === "campaigns"
              ? "text-yellow-400 border-b-2 border-yellow-400"
              : "text-white/50 hover:text-white/70"
          }`}
        >
          Sent Campaigns ({campaigns.length})
        </button>
      </div>

      {activeTab === "subscribers" && (
        <div className="glass rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedSubscribers.length === subscribers.length && subscribers.length > 0}
                onChange={toggleAllSubscribers}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-white/70">
                {selectedSubscribers.length > 0
                  ? `${selectedSubscribers.length} selected`
                  : "Select all"}
              </span>
            </div>
            {selectedSubscribers.length > 0 && (
              <button
                onClick={() => setActiveTab("compose")}
                className="text-sm text-yellow-400 hover:text-yellow-300"
              >
                Send to selected →
              </button>
            )}
          </div>
          
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm text-white/70 font-semibold w-12"></th>
                <th className="text-left p-4 text-sm text-white/70 font-semibold">Email</th>
                <th className="text-left p-4 text-sm text-white/70 font-semibold">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center p-8 text-white/50">
                    No subscribers yet
                  </td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.includes(sub.id)}
                        onChange={() => toggleSubscriber(sub.id)}
                        className="w-4 h-4 rounded"
                      />
                    </td>
                    <td className="p-4 text-white text-sm">{sub.email}</td>
                    <td className="p-4 text-white/70 text-sm">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "compose" && (
        <div className="space-y-6">
          <div className="glass rounded-2xl p-4 border-l-4 border-yellow-400">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-white text-sm font-semibold">Email Configuration Required</p>
                <p className="text-white/70 text-xs mt-1">
                  Configure SMTP settings in Settings page before sending emails.
                </p>
              </div>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject..."
                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Content</label>
              <div className="newsletter-editor">
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  placeholder="Write your newsletter content..."
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      ["bold", "italic", "underline"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["link"],
                      ["clean"],
                    ],
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="text-sm text-white/70">
                {selectedSubscribers.length > 0
                  ? `Sending to ${selectedSubscribers.length} selected subscriber(s)`
                  : `Sending to all ${subscribers.length} subscriber(s)`}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSendTest}
                  disabled={sending || !subject || !content}
                  className="px-4 py-2 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 disabled:opacity-50 transition-colors"
                >
                  Send Test
                </button>
                <button
                  onClick={handleSendNewsletter}
                  disabled={sending || !subject || !content || subscribers.length === 0}
                  className="px-6 py-2 bg-yellow-400 text-black rounded-xl font-semibold hover:bg-yellow-300 disabled:opacity-50 transition-colors"
                >
                  {sending ? "Sending..." : "Send Newsletter"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "campaigns" && (
        <div className="glass rounded-3xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm text-white/70 font-semibold">Subject</th>
                <th className="text-left p-4 text-sm text-white/70 font-semibold">Recipients</th>
                <th className="text-left p-4 text-sm text-white/70 font-semibold">Sent By</th>
                <th className="text-left p-4 text-sm text-white/70 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-white/50">
                    No campaigns sent yet
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 text-white text-sm font-semibold">{campaign.subject}</td>
                    <td className="p-4 text-white/70 text-sm">{campaign.recipients_count}</td>
                    <td className="p-4 text-white/70 text-sm">{campaign.sent_by_username}</td>
                    <td className="p-4 text-white/70 text-sm">
                      {new Date(campaign.sent_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
