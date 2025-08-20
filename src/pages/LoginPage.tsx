// File: src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const LoginPage: React.FC = () => {
  const { requestOtp, verifyOtp } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phase, setPhase] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation() as any;
  const redirectTo = location.state?.from || "/";

  const submitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return alert("Enter phone number");
    setLoading(true);
    const ok = await requestOtp(phone.trim());
    setLoading(false);
    if (!ok) return alert("Failed to send OTP. Try again.");
    setPhase("otp");
    alert("OTP sent (check server logs/SMS gateway).");
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return alert("Enter OTP");
    setLoading(true);
    const ok = await verifyOtp(phone.trim(), otp.trim());
    setLoading(false);
    if (!ok) return alert("Invalid OTP");
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#E8F3F1]">
      <Navbar />
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Login with Phone</h1>

        {phase === "phone" ? (
          <form onSubmit={submitPhone} className="space-y-3 bg-white p-4 rounded shadow">
            <label className="block text-sm">Phone Number</label>
            <input
              type="tel"
              placeholder="e.g. +1 555 555 5555"
              className="w-full border rounded p-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button
              disabled={loading}
              className="w-full bg-[#2A9D8F] text-white py-2 rounded disabled:opacity-50"
            >
              {loading ? "Sending OTP…" : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={submitOtp} className="space-y-3 bg-white p-4 rounded shadow">
            <div className="text-sm text-gray-600">OTP sent to {phone}</div>
            <label className="block text-sm">Enter OTP</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              disabled={loading}
              className="w-full bg-[#2A9D8F] text-white py-2 rounded disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Verify & Continue"}
            </button>
            <div className="text-xs text-gray-500">
              Wrong number?{" "}
              <button type="button" className="underline" onClick={() => setPhase("phone")}>
                change
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-4">
          <Link to="/" className="text-[#2A9D8F] underline text-sm">
            Back to menu
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
