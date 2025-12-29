import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { useTheme } from "../hooks/useTheme.js";
import Navigation from "../components/Navigation.jsx";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [settings, setSettings] = useState(null);
  const [status, setStatus] = useState("PENDING");
  const [message, setMessage] = useState("Waiting for payment confirmation...");
  const [downloadLinks, setDownloadLinks] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const pollTimerRef = useRef(null);
  const redirectTimerRef = useRef(null);

  const referenceId = searchParams.get("ref");
  const orderRef = searchParams.get("order");

  useEffect(() => {
    // Load settings
    api.get("/public/bootstrap/").then(res => setSettings(res.data.settings));

    if (!referenceId) {
      navigate("/");
      return;
    }

    // Poll payment status
    let tries = 0;
    const maxTries = 60; // 3 minutes max

    pollTimerRef.current = setInterval(async () => {
      tries += 1;

      try {
        const res = await api.get(`/public/momo/status/${referenceId}/`);
        const momoStatus = res?.data?.momo_status;
        const orderStatus = res?.data?.order_status;
        const links = res?.data?.download_links || [];

        setStatus(momoStatus || "PENDING");

        if (orderStatus === "PAID") {
          // Payment successful!
          clearInterval(pollTimerRef.current);
          setMessage("Payment successful! ✅");
          setDownloadLinks(links);
          setStatus("SUCCESSFUL");

          // Start 5 second countdown
          setCountdown(5);
          let count = 5;
          redirectTimerRef.current = setInterval(() => {
            count -= 1;
            setCountdown(count);
            if (count <= 0) {
              clearInterval(redirectTimerRef.current);
              navigate("/");
            }
          }, 1000);

          return;
        }

        if (momoStatus === "FAILED") {
          clearInterval(pollTimerRef.current);
          setMessage("Payment failed. Please try again.");
          setStatus("FAILED");
          return;
        }

        setMessage(`Waiting for payment... (${momoStatus || "Processing"})`);

        if (tries >= maxTries) {
          clearInterval(pollTimerRef.current);
          setMessage("Payment is taking longer than expected. Check your order status later.");
        }
      } catch (err) {
        console.error("Status poll error:", err);
        if (tries >= maxTries) {
          clearInterval(pollTimerRef.current);
          setMessage("Could not confirm payment status. Please check your order.");
        }
      }
    }, 3000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (redirectTimerRef.current) clearInterval(redirectTimerRef.current);
    };
  }, [referenceId, navigate]);

  // Apply theme colors globally
  useTheme(settings);

  const bgColor = settings?.secondary_color || "#0b1220";

  return (
    <div style={{ background: bgColor }} className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Navigation settings={settings} />

        <div className="mt-20 flex items-center justify-center">
          <div className="max-w-2xl w-full glass rounded-3xl p-12 text-center">
            {/* Status Icon */}
            <div className="mb-8">
              {status === "SUCCESSFUL" ? (
                <div className="w-24 h-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : status === "FAILED" ? (
                <div className="w-24 h-24 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              ) : (
                <div className="w-24 h-24 mx-auto rounded-full bg-yellow-400/20 flex items-center justify-center">
                  <svg className="w-12 h-12 text-yellow-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              )}
            </div>

            {/* Order Reference */}
            {orderRef && (
              <div className="mb-6">
                <p className="text-sm text-white/60">Order Reference</p>
                <p className="text-xl font-mono font-bold text-yellow-400 mt-1">{orderRef}</p>
              </div>
            )}

            {/* Status Message */}
            <h1 className="text-3xl font-bold mb-4">
              {status === "SUCCESSFUL" ? "Payment Successful!" : 
               status === "FAILED" ? "Payment Failed" : 
               "Processing Payment..."}
            </h1>
            <p className="text-lg text-white/80 mb-8">{message}</p>

            {/* Download Links */}
            {downloadLinks.length > 0 && (
              <div className="mb-8 p-6 rounded-2xl bg-blue-500/10 border border-blue-500/30">
                <h3 className="font-semibold mb-4">Your Downloads</h3>
                <div className="space-y-3">
                  {downloadLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{link.product}</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Instructions */}
            {status === "PENDING" && (
              <div className="p-6 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 mb-8">
                <p className="text-sm text-yellow-200">
                  Please approve the payment on your phone. You'll receive an MTN MoMo prompt.
                </p>
              </div>
            )}

            {/* Countdown */}
            {countdown !== null && (
              <div className="mb-6">
                <p className="text-white/70">
                  Redirecting to home in <span className="font-bold text-yellow-400">{countdown}</span> seconds...
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              {status === "SUCCESSFUL" || status === "FAILED" ? (
                <button
                  onClick={() => navigate("/")}
                  className="px-8 py-3 rounded-2xl bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition-colors"
                >
                  Back to Home
                </button>
              ) : (
                <button
                  onClick={() => navigate("/")}
                  className="px-8 py-3 rounded-2xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
