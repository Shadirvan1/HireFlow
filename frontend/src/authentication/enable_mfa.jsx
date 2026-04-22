import axios from "axios";
import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function SetupMFA() {
  const [otpUri, setOtpUri] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMFA() {
      try {
        const res = await api.get("accounts/hr/setup-mfa/");
        setOtpUri(res.data.otp_uri);
      } catch (err) {
        setMessage(err.response?.data?.error || "Failed to load MFA setup");
      }
    }
    fetchMFA();
  }, []);

  const verifyMFA = async () => {
    try {
      const res = await api.post("accounts/hr/setup-mfa/", { otp });
      setTimeout(() => {
        navigate("/hr/dashboard");
      }, 1000);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || "OTP verification failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4">
      <div className="bg-white shadow-xl border border-gray-100 rounded-3xl w-full max-w-md p-8 flex flex-col items-center">

        {/* Header */}
        <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mb-5">
          <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Two-Factor Authentication
        </h2>
        <p className="text-sm text-gray-400 mt-1 mb-6 text-center">
          Secure your account with an authenticator app
        </p>

        {/* QR Code Section */}
        {otpUri && (
          <div className="w-full flex flex-col items-center bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-6">
            <p className="text-sm font-medium text-gray-600 text-center mb-4">
              Scan this QR code with Google Authenticator or any TOTP app
            </p>
            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(otpUri)}&size=180x180`}
                alt="MFA QR Code"
                className="rounded-lg"
              />
            </div>
          </div>
        )}

        {/* OTP Input */}
        <div className="w-full mb-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            One-Time Password
          </label>
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none text-gray-900 text-sm bg-gray-50 placeholder-gray-400 transition-all"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={verifyMFA}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-sm"
        >
          Enable Two-Factor Authentication
        </button>

        {/* Message */}
        {message && (
          <p className={`mt-4 text-center text-sm font-medium ${
            message.toLowerCase().includes("success") || message.toLowerCase().includes("enabled")
              ? "text-green-600"
              : "text-red-500"
          }`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}